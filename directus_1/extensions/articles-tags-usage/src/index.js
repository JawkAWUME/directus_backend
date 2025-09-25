export default {
    id: 'articles-tags-usage',
    handler: (router, { services, database }) => {
        const { ItemsService } = services;
        router.get("/", async(req, res) => {
            try {
                const result = await database.select("t.nom as tag")
                    .count("at.articles_id as count")
                    .from("articles_tags as at")
                    .leftJoin("tags as t", "at.tags_id", "t.id")
                    .groupBy("t.nom")
                    .orderBy("count", "desc");

                console.log("Fetched tags usage:", result);
                res.json(result);
            } catch (error) {
                console.error("Error fetching tags usage:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }

        });
    }
}