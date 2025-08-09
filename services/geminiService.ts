
export const sendMessageStream = async (message: string): Promise<ReadableStream<Uint8Array>> => {
    const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
    });

    if (!response.ok || !response.body) {
        const errorText = await response.text();
        console.error("Error from AI assistant API:", errorText);
        throw new Error("Failed to get response from AI assistant.");
    }
    
    return response.body;
};