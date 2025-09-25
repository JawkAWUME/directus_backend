// generate-openapi.js
import fs from "fs";
import YAML from "yaml";

const DIRECTUS_URL = "http://localhost:8125";
const OUTPUT_FILE = "directus-openapi-v3.yaml";
const EMAIL = "admin@example.com";
const PASSWORD = "passer@123";

// --- Auth token ---
async function getAuthToken() {
    const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    if (!res.ok) throw new Error(`Erreur connexion: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return data.data.access_token;
}

// --- Fetch JSON helper ---
async function fetchJson(url, token) {
    const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    return res.json();
}

// --- Mapping Directus types → OpenAPI types avec relations ---
function mapType(f) {
    if (f.interface === "many-to-one" && f.options.collection) {
        return {
            $ref: `#/components/schemas/${f.options.collection}`,
            description: `Relation many-to-one vers la collection **${f.options.collection}**`,
        };
    }
    if (f.interface === "many-to-many" && f.options.collection) {
        return {
            type: "array",
            items: { $ref: `#/components/schemas/${f.options.collection}` },
            description: `Relation many-to-many avec la collection **${f.options.collection}**`,
        };
    }

    switch (f.type) {
        case "string":
        case "text":
        case "uuid":
        case "hash":
            return { type: "string" };
        case "integer":
        case "bigInteger":
            return { type: "integer" };
        case "float":
        case "decimal":
        case "double":
            return { type: "number" };
        case "boolean":
            return { type: "boolean" };
        case "dateTime":
        case "timestamp":
        case "date":
            return { type: "string", format: "date-time" };
        case "json":
            return { type: "object" };
        default:
            return { type: "string" };
    }
}

// --- Ajouter endpoints système Directus ---
function addSystemEndpoints(openapi) {
    const systemEndpoints = {
        users: {
            description: "Gestion des utilisateurs Directus",
            paths: ["/users", "/users/{id}"],
        },
        roles: {
            description: "Gestion des rôles et permissions",
            paths: ["/roles", "/roles/{id}"],
        },
        files: {
            description: "Gestion des fichiers uploadés",
            paths: ["/files", "/files/{id}"],
        },
        activity: {
            description: "Logs et activités Directus",
            paths: ["/activity", "/activity/{id}"],
        },
        settings: {
            description: "Configuration globale Directus",
            paths: ["/settings"],
        },
        flows: {
            description: "Gestion des flows (automatisations Directus)",
            paths: ["/flows", "/flows/{id}"],
        }
    };

    for (const [name, def] of Object.entries(systemEndpoints)) {
        openapi.tags.push({ name, description: def.description });

        for (const path of def.paths) {
            openapi.paths[path] = {
                get: {
                    tags: [name],
                    summary: `GET ${path}`,
                    description: `Récupère les données de ${name}.`,
                    parameters: path.includes("{id}") ? [{ name: "id", in: "path", required: true, schema: { type: "string" } }] : [],
                    responses: {
                        200: { description: "Succès" },
                        401: { description: "Non autorisé" },
                    },
                },
            };
        }
    }
}

// --- Génération OpenAPI ---
async function generateOpenApi() {
    try {
        const token = await getAuthToken();

        const collectionsRes = await fetchJson(`${DIRECTUS_URL}/collections`, token);
        const fieldsRes = await fetchJson(`${DIRECTUS_URL}/fields`, token);

        const collections = collectionsRes.data.filter(
            (c) =>
            c.collection &&
            !c.collection.startsWith("directus_") &&
            c.collection !== "content_management_project"
        );

        const fields = fieldsRes.data;

        const openapi = {
            openapi: "3.0.0",
            info: {
                title: "Directus API",
                version: "1.0.0",
                description: "📘 Documentation auto-générée à partir des collections Directus et des endpoints système.\n" +
                    "⚡ Inclus les endpoints `/items/{collection}`, `/auth/*`, `/users`, `/roles`, `/files`, etc.",
            },
            servers: [{ url: DIRECTUS_URL }],
            paths: {},
            tags: [],
            components: {
                schemas: {},
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                        description: "⚠️ Ajoutez `Authorization: Bearer <token>` pour accéder aux endpoints protégés.",
                    },
                },
            },
            security: [{ bearerAuth: [] }],
        };

        // 🔑 Auth endpoints
        openapi.tags.push({ name: "Authentification", description: "Connexion, déconnexion et refresh token" });

        openapi.paths["/auth/login"] = {
            post: {
                tags: ["Authentification"],
                summary: "Se connecter",
                description: "Authentifie un utilisateur avec email/mot de passe et retourne un token JWT.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { type: "string", example: EMAIL },
                                    password: { type: "string", example: "••••••" },
                                },
                                required: ["email", "password"],
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Connexion réussie" },
                    401: { description: "Identifiants invalides" },
                },
                security: [],
            },
        };

        openapi.paths["/auth/logout"] = {
            post: {
                tags: ["Authentification"],
                summary: "Se déconnecter",
                description: "Invalide le token JWT en cours et déconnecte l'utilisateur.",
                responses: { 204: { description: "Déconnexion réussie" } },
            },
        };

        openapi.paths["/auth/refresh"] = {
            post: {
                tags: ["Authentification"],
                summary: "Rafraîchir le token JWT",
                description: "Renvoie un nouveau token JWT en utilisant un refresh token valide.",
                responses: {
                    200: { description: "Nouveau token généré" },
                    401: { description: "Refresh token invalide ou expiré" },
                },
            },
        };

        // 📦 Collections personnalisées
        for (const colDef of collections) {
            const collection = colDef.collection;
            const collectionFields = fields.filter((f) => f.collection === collection);

            const properties = {};
            const required = [];

            for (const f of collectionFields) {
                properties[f.field] = mapType(f);
                if (f.meta.required) required.push(f.field);
            }

            openapi.components.schemas[collection] = {
                type: "object",
                description: `Schéma de la collection **${collection}**`,
                properties,
                ...(required.length ? { required } : {}),
            };

            // Ajouter un tag par collection
            openapi.tags.push({
                name: collection,
                description: `Endpoints CRUD pour la collection **${collection}**`,
            });

            // CRUD endpoints
            openapi.paths[`/items/${collection}`] = {
                get: {
                    tags: [collection],
                    summary: `Lister les ${collection}`,
                    responses: { 200: { description: "Succès" } },
                },
                post: {
                    tags: [collection],
                    summary: `Créer un ${collection}`,
                    requestBody: {
                        required: true,
                        content: { "application/json": { schema: { $ref: `#/components/schemas/${collection}` } } },
                    },
                    responses: { 201: { description: "Créé" } },
                },
            };

            openapi.paths[`/items/${collection}/{id}`] = {
                get: {
                    tags: [collection],
                    summary: `Obtenir un ${collection} par ID`,
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Succès" } },
                },
                patch: {
                    tags: [collection],
                    summary: `Mettre à jour un ${collection}`,
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Mis à jour" } },
                },
                delete: {
                    tags: [collection],
                    summary: `Supprimer un ${collection}`,
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 204: { description: "Supprimé" } },
                },
            };
        }

        // 🚀 Ajouter endpoints système
        addSystemEndpoints(openapi);

        fs.writeFileSync(OUTPUT_FILE, YAML.stringify(openapi));
        console.log(`✅ OpenAPI schema généré : ${OUTPUT_FILE}`);
    } catch (err) {
        console.error("❌ Error generating OpenAPI:");
        console.error(err.stack || err.message);
    }
}

generateOpenApi();