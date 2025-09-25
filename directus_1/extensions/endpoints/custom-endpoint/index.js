export default function registerEndpoint(router, {services, database, logger}) {
    router.get('/', async (req, res) => {
        try {
            // Log the request for debugging
            logger.info('Received request at custom endpoint', { query: req.query });

            // Example of using a service to fetch data
            const data = await services.items.read({
                collection: 'test_collection_2',
                limit: 10,
            });

            // Send the response
            res.json(data);
        } catch (error) {
            logger.error('Error in custom endpoint:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}