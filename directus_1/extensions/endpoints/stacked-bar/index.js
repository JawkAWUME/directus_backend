export default {
    id: "stacked-bar",
    handler: (router, { services, exceptions }) => {
        const { ItemsService } = services;
        const { ServiceUnavailableException } = exceptions;

        router.get("/", async(req, res) => {
            try {
                const articlesService = new ItemsService("articles", {
                    schema: req.schema,
                    accountability: req.accountability,
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

                console.log("✅ Endpoint stacked-bar loaded successfully");
                res.json(result);
            } catch (error) {
                if (error instanceof ServiceUnavailableException) {
                    res.status(503).json({ error: "Service unavailable" });
                } else {
                    console.error(error);
                    res.status(500).json({ error: "Internal server error" });
                }
            }
        });
    },
};