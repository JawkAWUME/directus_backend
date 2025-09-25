export default {
    id: "articles-by-category",
    handler: (router, { services }) => {
        const { ItemsService } = services;

        router.get("/", async(req, res) => {
            try {
                const articlesService = new ItemsService("articles", {
                    schema: req.schema,
                    accountability: { admin: true }
                });

                // Récupérer les articles avec la relation catégorie
                const articles = await articlesService.readByQuery({
                    fields: ["id", "categorie.id", "categorie.nom"],
                });

                console.log("Articles fetched:", articles);

                // Agréger par catégorie
                const data = {};
                for (const a of articles) {
                    // 🔑 Si categorie est null → on remplace par "Sans catégorie"
                    const categoryName = a.categorie ? a.categorie.nom : "Sans catégorie";

                    console.log("Article:", a.id, "Category:", categoryName);

                    if (!data[categoryName]) {
                        data[categoryName] = { total: 0 };
                    }

                    data[categoryName].total++;
                }

                // Convertir en tableau
                const result = Object.keys(data).map((cat) => ({
                    category: cat,
                    count: data[cat].total,
                }));

                console.log("✅ Endpoint articles-by-category loaded successfully");
                res.json(result);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal error" });
            }
        });
    },
};