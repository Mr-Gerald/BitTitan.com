
export const config = {
  runtime: 'edge',
};

export default async function handle(req: Request) {
    if (req.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
    const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;

    if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
        console.error("Server configuration error: JSONBin credentials not set.");
        return new Response(JSON.stringify({ error: 'Server configuration error.' }), { status: 500, headers: { 'Content-Type': 'application/json' }});
    }

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            method: 'GET',
            headers: { 'X-Master-Key': JSONBIN_API_KEY },
        });

        if (response.status === 404) {
             return new Response(JSON.stringify({ message: 'Bin not found, will be created on first save.' }), { status: 404, headers: { 'Content-Type': 'application/json' }});
        }

        if (!response.ok) {
            const errorData = await response.text();
            console.error("JSONBin fetch error:", errorData);
            return new Response(JSON.stringify({ error: `Failed to fetch data from remote storage.` }), { status: response.status, headers: { 'Content-Type': 'application/json' }});
        }

        const data = await response.json();
        // Return the record property which contains our state
        return new Response(JSON.stringify(data.record), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        console.error("Internal Server Error in get-state:", err);
        return new Response(JSON.stringify({ error: `Internal Server Error: ${err.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' }});
    }
}