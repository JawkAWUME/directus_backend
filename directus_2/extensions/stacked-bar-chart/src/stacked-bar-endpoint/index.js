export default {
    id: "stacked-bar",
    handler: (router, { services }) => { // <-- pas d'exceptions
        const { ItemsService } = services;

        router.get("/", async(req, res) => {
            try {
                const articlesService = new ItemsService("articles", {
                    schema: req.schema,
                    accountability: { admin: true }
                });

                const articles = await articlesService.readByQuery({
                    fields: ["id", "etat", "auteur.id", "auteur.prenom", "auteur.nom"],
                });

                const data = {};
                for (const a of articles) {
                    const userName = a.auteur ?
                        `${a.auteur.prenom} ${a.auteur.nom}` :
                        "Inconnu";

                    if (!data[userName]) {
                        data[userName] = { total: 0, Brouillon: 0, Publié: 0, Archivé: 0 };
                    }

                    data[userName].total++;
                    if (a.etat) {
                        data[userName][a.etat] = (data[userName][a.etat] || 0) + 1;
                    }
                }

                const result = Object.keys(data).map((user) => ({
                    user,
                    ...data[user],
                }));

                console.log("✅ Endpoint stacked-bar-chart loaded successfully");
                res.json(result);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    },
};