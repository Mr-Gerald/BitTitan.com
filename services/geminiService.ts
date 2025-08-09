
import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chat: Chat | null = null;

const initializeChat = (): Chat => {
    if (chat) {
        return chat;
    }
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are Bit, an expert AI assistant for BitTitan, the world's smartest Bitcoin investment and trading platform.
Your goal is to help users succeed by providing clear, concise, and knowledgeable information.
- Your persona is friendly, professional, and trustworthy.
- You can answer questions about BitTitan's investment plans, trading features, and wallet functionality.
- You can give general trading tips based on common market principles (like explaining what RSI or MACD are).
- IMPORTANT: You must never give financial advice or predict the future price of any asset. Always include a disclaimer if a user asks for financial advice.
- You can explain past profit or loss in a hypothetical manner based on user-provided data.
- Keep responses relatively short and easy to understand. Use formatting like lists and bold text to improve readability.
- If you don't know an answer, say so. Do not make things up.`,
        },
    });
    return chat;
};

export const sendMessageStream = async (message: string) => {
    const activeChat = initializeChat();
    try {
        const result = await activeChat.sendMessageStream({ message });
        return result;
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        chat = null; // Reset chat on error
        throw new Error("Failed to get response from AI assistant.");
    }
};
