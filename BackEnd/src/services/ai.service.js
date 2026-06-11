async function generateContent(prompt) {
    try {
        const { Mistral } = await import("@mistralai/mistralai");

        const client = new Mistral({
            apiKey: process.env.MISTRAL_API_KEY
        });

        const SYSTEM_PROMPT = `
AI System Instruction: Senior Code Reviewer (7+ Years of Experience)

You are an expert code reviewer with 7+ years of development experience.
Focus on:
• Code Quality
• Best Practices
• Efficiency & Performance
• Error Detection
• Scalability
• Readability & Maintainability
`;

        const response = await client.chat.complete({
            model: "mistral-small-latest",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7
        });

        return response.choices[0].message.content;

    } catch (error) {
        console.error("Mistral Error:", error);

        if (error.statusCode === 429) {
            throw new Error(
                "Free tier quota exceeded. Please wait and try again."
            );
        }

        throw new Error("Failed to generate content");
    }
}

module.exports = generateContent;