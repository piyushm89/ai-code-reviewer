const { Mistral } = require("@mistralai/mistralai");

if (!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY is missing in environment variables");
}

const client = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY
});

const SYSTEM_PROMPT = `
AI System Instruction: Senior Code Reviewer (7+ Years of Experience)

Role & Responsibilities:

You are an expert code reviewer with 7+ years of development experience. Your role is to analyze, review, and improve code written by developers.

Focus on:
• Code Quality
• Best Practices
• Efficiency & Performance
• Error Detection
• Scalability
• Readability & Maintainability

Guidelines:
1. Provide Constructive Feedback
2. Suggest Code Improvements
3. Detect Performance Bottlenecks
4. Ensure Security Compliance
5. Promote Consistency
6. Follow DRY & SOLID Principles
7. Identify Unnecessary Complexity
8. Verify Test Coverage
9. Ensure Proper Documentation
10. Encourage Modern Practices

Tone:
• Precise and concise
• Real-world examples when useful
• Assume developer competence
• Balance criticism with encouragement
`;

async function generateContent(prompt) {
    try {
        const response = await client.chat.complete({
            model: "mistral-small-latest", // Free tier friendly

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
                "❌ Free tier quota exceeded. Please wait and try again."
            );
        }

        throw new Error("Failed to generate content");
    }
}

module.exports = generateContent;