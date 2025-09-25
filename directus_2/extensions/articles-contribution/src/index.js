export default {
    id: "articles-by-user",
    handler: (router, { services }) => {
        const { ItemsService } = services;

        // 📊 Endpoint : nombre d’articles par utilisateur
        router.get("/", async(req, res) => {
            try {
                const articlesService = new ItemsService("articles", {
                    schema: req.schema,
                    accountability: { admin: true }
                });

                // Charger les articles avec les infos d’auteur
                const articles = await articlesService.readByQuery({
                    fields: ["auteur.id", "auteur.prenom", "auteur.nom"],
                });

                console.log("Articles fetched:", articles);

                // Agréger par auteur
                const data = {};
                for (const a of articles) {
                    const authorName = a.auteur ?
                        `${a.auteur.prenom} ${a.auteur.nom}` :
                        "Inconnu";

                    console.log("Article:", a.id, "Auteur:", authorName);

                    if (!data[authorName]) {
                        data[authorName] = { total: 0 };
                    }

                    data[authorName].total++;
                }

                // Transformer en tableau
                const result = Object.keys(data).map((author) => ({
                    author,
                    count: data[author].total,
                }));

                console.log("✅ Endpoint articles-by-user loaded successfully");
                res.json(result);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal error" });
            }
        });

        // 📊 Endpoint : total d’articles (métrique simple)
        router.get("/count", async(req, res) => {
            try {
                const articlesService = new ItemsService("articles", {
                    schema: req.schema,
                    accountability: { admin: true }
                });

                const articles = await articlesService.readByQuery({
                    fields: ["id"],
                });

                const total = articles.length;

                console.log("✅ Endpoint articles-by-user/count loaded successfully");
                res.json({ total });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal error" });
            }
        });
    },
};