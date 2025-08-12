
export const config = {
  runtime: 'edge',
};

// Helper function to create a new bin for an image and return its ID
const createNewImageBin = async (base64Data: string, apiKey: string): Promise<string | null> => {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'X-Master-Key': apiKey,
            'X-Bin-Private': 'true',
        };

        const collectionId = process.env.JSONBIN_COLLECTION_ID;
        if (collectionId) {
            headers['X-Collection-Id'] = collectionId;
        }

        const res = await fetch('https://api.jsonbin.io/v3/b', {
            method: 'POST',
            headers,
            body: JSON.stringify({ imageData: base64Data }),
        });

        if (!res.ok) {
            console.error(`Failed to create new image bin: ${res.statusText}`);
            return null;
        }

        const data = await res.json();
        return data.metadata.id;

    } catch (err) {
        console.error('Error creating new image bin:', err);
        return null;
    }
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

        // --- Start Image Offloading ---
        for (const request of stateToPersist.depositRequests || []) {
            if (request.proofImage && request.proofImage.startsWith('data:image')) {
                const imageBinId = await createNewImageBin(request.proofImage, JSONBIN_API_KEY);
                if (imageBinId) request.proofImage = `BIN_ID:${imageBinId}`; 
            }
        }
        for (const user of stateToPersist.allUsers || []) {
            if (user.verificationData?.idDocument?.frontImage?.startsWith('data:image')) {
                const binId = await createNewImageBin(user.verificationData.idDocument.frontImage, JSONBIN_API_KEY);
                 if (binId && user.verificationData?.idDocument) user.verificationData.idDocument.frontImage = `BIN_ID:${binId}`;
            }
            if (user.verificationData?.idDocument?.backImage?.startsWith('data:image')) {
                const binId = await createNewImageBin(user.verificationData.idDocument.backImage, JSONBIN_API_KEY);
                 if (binId && user.verificationData?.idDocument) user.verificationData.idDocument.backImage = `BIN_ID:${binId}`;
            }
            if (user.avatarUrl && user.avatarUrl.startsWith('data:image')) {
                const binId = await createNewImageBin(user.avatarUrl, JSONBIN_API_KEY);
                if(binId) user.avatarUrl = `BIN_ID:${binId}`;
            }
        }
        // --- End Image Offloading ---

        let response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY },
            body: JSON.stringify(stateToPersist),
        });
        
        // AUTO-RECOVERY: If the bin was deleted, create a new one.
        if (response.status === 404) {
            console.warn(`Bin ID ${JSONBIN_BIN_ID} not found. Attempting to create a new bin...`);

            const createResponse = await fetch('https://api.jsonbin.io/v3/b', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY,
                    'X-Bin-Name': 'BitTitan Main State (Auto-Recreated)',
                    'X-Bin-Private': 'true',
                },
                body: JSON.stringify(stateToPersist),
            });

            if (!createResponse.ok) {
                const errorData = await createResponse.text();
                console.error("Failed to create a new bin after 404:", errorData);
                return new Response(JSON.stringify({ error: `Original bin was not found and failed to create a new one.` }), { status: 500 });
            }

            const newData = await createResponse.json();
            const newBinId = newData.metadata.id;
            const recoveryMessage = `CRITICAL: Your data bin was not found and has been recreated. Your latest changes have been saved to a NEW bin. You MUST update your 'JSONBIN_BIN_ID' environment variable to '${newBinId}' to ensure data loads correctly in the future.`;
            console.error(recoveryMessage);

            return new Response(JSON.stringify({ 
                error: 'DATA_BIN_RECREATED',
                message: recoveryMessage,
                newBinId: newBinId,
            }), { status: 500, headers: { 'Content-Type': 'application/json' }});
        }
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error("JSONBin save error:", errorData);
            return new Response(JSON.stringify({ error: `Failed to save data to remote storage.` }), { status: response.status });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (err: any) {
        console.error("Internal Server Error in save-state:", err);
        return new Response(JSON.stringify({ error: `Internal Server Error: ${err.message}` }), { status: 500 });
    }
}