// utils/imageCompressor.ts

const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const MIME_TYPE = "image/jpeg";
const QUALITY = 0.9;

export const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const blobURL = URL.createObjectURL(file);
        const img = new Image();
        img.src = blobURL;

        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject("Failed to load image.");
        };

        img.onload = () => {
            URL.revokeObjectURL(img.src);

            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                return reject("Could not get canvas context");
            }

            ctx.drawImage(img, 0, 0, width, height);
            
            const dataUrl = canvas.toDataURL(MIME_TYPE, QUALITY);
            resolve(dataUrl);
        };
    });
};