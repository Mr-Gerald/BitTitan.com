
export const config = {
  runtime: 'edge',
};

export default async function handle(req: Request) {
    if (req.method !== 'PUT') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
    const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;

    if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
         console.error("Server configuration error: JSONBin credentials not set.");
        return new Response(JSON.stringify({ error: 'Server configuration error.' }), { status: 500, headers: { 'Content-Type': 'application/json' }});
    }

    try {
        const stateToPersist = await req.json();

        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY,
            },
            body: JSON.stringify(stateToPersist),
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error("JSONBin save error:", errorData);
            return new Response(JSON.stringify({ error: `Failed to save data to remote storage.` }), { status: response.status, headers: { 'Content-Type': 'application/json' }});
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        console.error("Internal Server Error in save-state:", err);
        return new Response(JSON.stringify({ error: `Internal Server Error: ${err.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' }});
    }
}