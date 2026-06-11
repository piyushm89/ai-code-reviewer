const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
    try {
        const code = req.body?.code;

        if (!code || !code.trim()) {
            return res.status(400).json({ error: "Code is required" });
        }

        const response = await aiService(code);

        // Success: return the review as plain text so the frontend can render it
        // directly with react-markdown.
        return res.type("text/plain").send(response);
    } catch (error) {
        console.error("AI controller error:", error);

        const message = error.message || "";

        if (message.toLowerCase().includes("quota")) {
            return res
                .status(503)
                .json({ error: "AI service quota exceeded. Please try again later." });
        }

        if (message.includes("MISTRAL_API_KEY")) {
            return res
                .status(500)
                .json({ error: "Server misconfiguration: MISTRAL_API_KEY is missing." });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
};
