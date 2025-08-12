
export const config = {
  runtime: 'edge',
};

// Helper function to fetch image data from a specific bin
const getImageData = async (binId: string, apiKey: string): Promise<string> => {
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
            headers: { 'X-Master-Key': apiKey },
        });
        if (!res.ok) {
            console.error(`Failed to fetch image bin ${binId}: ${res.statusText}`);
            return ''; // Return empty string on failure
        }
        const data = await res.json();
        return data.record.imageData || '';
    } catch (err) {
        console.error(`Error fetching image bin ${binId}:`, err);
        return '';
    }
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
        const state = data.record;

        // --- Start Image Rehydration ---
        const hydrationPromises: Promise<void>[] = [];

        // Scan deposit requests
        for (const request of state.depositRequests || []) {
            if (request.proofImage && request.proofImage.startsWith('BIN_ID:')) {
                const binId = request.proofImage.replace('BIN_ID:', '');
                hydrationPromises.push(
                    getImageData(binId, JSONBIN_API_KEY).then(imageData => {
                        request.proofImage = imageData;
                    })
                );
            }
        }

        // Scan user data (verification, avatar)
        for (const user of state.allUsers || []) {
            if (user.verificationData?.idDocument?.frontImage?.startsWith('BIN_ID:')) {
                const binId = user.verificationData.idDocument.frontImage.replace('BIN_ID:', '');
                 hydrationPromises.push(
                    getImageData(binId, JSONBIN_API_KEY).then(imageData => {
                        if (user.verificationData?.idDocument) {
                            user.verificationData.idDocument.frontImage = imageData;
                        }
                    })
                );
            }
            if (user.verificationData?.idDocument?.backImage?.startsWith('BIN_ID:')) {
                const binId = user.verificationData.idDocument.backImage.replace('BIN_ID:', '');
                 hydrationPromises.push(
                    getImageData(binId, JSONBIN_API_KEY).then(imageData => {
                         if (user.verificationData?.idDocument) {
                            user.verificationData.idDocument.backImage = imageData;
                        }
                    })
                );
            }
            if (user.avatarUrl && user.avatarUrl.startsWith('BIN_ID:')) {
                const binId = user.avatarUrl.replace('BIN_ID:', '');
                hydrationPromises.push(
                    getImageData(binId, JSONBIN_API_KEY).then(imageData => {
                        user.avatarUrl = imageData;
                    })
                );
            }
        }
        
        // Wait for all images to be fetched and rehydrated
        await Promise.all(hydrationPromises);
        // --- End Image Rehydration ---


        // Return the fully rehydrated state
        return new Response(JSON.stringify(state), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        console.error("Internal Server Error in get-state:", err);
        return new Response(JSON.stringify({ error: `Internal Server Error: ${err.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' }});
    }
}