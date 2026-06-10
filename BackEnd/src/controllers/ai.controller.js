const aiService = require("../services/ai.service")


module.exports.getReview = async (req, res) => {
    try {
        const code = req.body.code;

        if (!code) {
            return res.status(400).send("Prompt is required");
        }

        const response = await aiService(code);

        return res.send(response);
    } catch (error) {
        console.error('AI controller error:', error);
        // If it's a quota error from the AI service, respond 503 (service unavailable)
        if (error.message && error.message.toLowerCase().includes('quota')) {
            return res.status(503).send({ error: 'AI service quota exceeded. Please try again later.' });
        }

        return res.status(500).send({ error: 'Internal server error' });
    }
}