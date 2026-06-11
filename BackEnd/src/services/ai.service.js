// @mistralai/mistralai v2 is an ESM-only package, so it must be loaded with a
// dynamic import() from this CommonJS module. We cache the client across
// requests instead of re-creating it every call.
let clientPromise;

async function getClient() {
    if (!process.env.MISTRAL_API_KEY) {
        throw new Error("MISTRAL_API_KEY is not set in the environment");
    }

    if (!clientPromise) {
        clientPromise = import("@mistralai/mistralai").then(
            ({ Mistral }) => new Mistral({ apiKey: process.env.MISTRAL_API_KEY })
        );
    }

    return clientPromise;
}

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

async function generateContent(prompt) {
    try {
        const client = await getClient();

        const response = await client.chat.complete({
            model: "mistral-small-latest",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
        });

        const content = response?.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("Empty response from Mistral");
        }

        return content;
    } catch (error) {
        console.error("Mistral Error:", error);

        if (error.statusCode === 429) {
            throw new Error("Free tier quota exceeded. Please wait and try again.");
        }

        // Re-throw config errors with their real message so they surface clearly.
        if (error.message && error.message.includes("MISTRAL_API_KEY")) {
            throw error;
        }

        throw new Error("Failed to generate content");
    }
}

module.exports = generateContent;
