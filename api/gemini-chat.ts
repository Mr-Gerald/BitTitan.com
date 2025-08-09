
import { GoogleGenAI, Chat } from "@google/genai";

export const config = {
  runtime: 'edge',
};

// This function-level cache is not guaranteed to persist across invocations,
// but can help reduce re-initialization on subsequent calls to a warm function.
let chat: Chat | null = null;

const initializeChat = (): Chat => {
    if (chat) {
        return chat;
    }
    
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable not set");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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


export default async function handle(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { message } = await req.json();

        if (!message) {
            return new Response('Missing message in request body', { status: 400 });
        }

        const activeChat = initializeChat();
        const geminiStream = await activeChat.sendMessageStream({ message });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for await (const chunk of geminiStream) {
                    const text = chunk.text;
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
                controller.close();
            },
             cancel() {
                console.log("Stream canceled by client.");
            }
        });

        return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

    } catch (error: any) {
        console.error("Error in Gemini chat handler:", error);
        // Reset chat on error in case the state is corrupted
        chat = null;
        return new Response(JSON.stringify({ error: 'Failed to get response from AI assistant.', details: error.message }), { status: 500 });
    }
}