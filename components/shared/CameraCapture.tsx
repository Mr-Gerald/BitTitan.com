import React, { useRef, useEffect, useState } from 'react';
import Card from './Card';
import Icon from './Icon';
import { CLOSE_ICON } from '../../constants';

interface CameraCaptureProps {
    onCapture: (imageDataUrl: string) => void;
    onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let stream: MediaStream;
        const startCamera = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } else {
                    setError('Camera access is not supported by your browser.');
                }
            } catch (err) {
                 setError('Camera access denied. Please allow camera access in your browser settings.');
                 console.error(err);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if(context){
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/png');
                onCapture(dataUrl);
            }
        }
    };
    
    return (
        <Card className="w-full max-w-lg relative animate-fade-in-up p-0 overflow-hidden">
            <button onClick={onClose} className="absolute top-4 right-4 text-white z-10 bg-black/30 rounded-full p-1">
                <Icon>{CLOSE_ICON}</Icon>
            </button>
            <div className="relative">
                {error ? (
                    <div className="p-8 text-center">
                        <h3 className="text-lg font-bold text-accent-danger">Camera Error</h3>
                        <p className="text-basetitan-text-secondary mt-2">{error}</p>
                    </div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
                )}
                 {!error && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
                        <button
                            onClick={handleCapture}
                            className="w-16 h-16 bg-white rounded-full border-4 border-basetitan-dark shadow-lg"
                            aria-label="Capture photo"
                        />
                    </div>
                )}
            </div>
        </Card>
    );
};

export default CameraCapture;