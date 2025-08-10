
import React, { useState, useRef } from 'react';
import Card from '../shared/Card';
import { VerificationData } from '../../types';
import CameraCapture from '../shared/CameraCapture';

interface Step2Props {
    nextStep: (data: { idDocument: VerificationData['idDocument'] }) => void;
    prevStep: () => void;
    formData?: VerificationData['idDocument'];
}

const Step2IDDocument: React.FC<Step2Props> = ({ nextStep, prevStep, formData }) => {
    const [doc, setDoc] = useState({
        type: formData?.type || "Driver's License",
        frontImage: formData?.frontImage || '',
        backImage: formData?.backImage || '',
    });
    const [error, setError] = useState('');
    const [showCameraFor, setShowCameraFor] = useState<'front' | 'back' | null>(null);
    const frontInputRef = useRef<HTMLInputElement>(null);
    const backInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setDoc({ ...doc, [side === 'front' ? 'frontImage' : 'backImage']: ev.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleCameraCapture = (imageDataUrl: string) => {
        if (showCameraFor) {
            setDoc({ ...doc, [showCameraFor === 'front' ? 'frontImage' : 'backImage']: imageDataUrl });
        }
        setShowCameraFor(null);
    };

    const handleNext = () => {
        if (!doc.frontImage || !doc.backImage) {
            setError('Please provide images for both front and back of your document.');
            return;
        }
        setError('');
        nextStep({ idDocument: doc as VerificationData['idDocument'] });
    };
    
    if(showCameraFor) {
        return <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCameraFor(null)} />;
    }

    const ImageBox: React.FC<{ side: 'front' | 'back' }> = ({ side }) => {
        const imageSrc = side === 'front' ? doc.frontImage : doc.backImage;
        const ref = side === 'front' ? frontInputRef : backInputRef;

        return (
            <div className="w-full p-4 border-2 border-dashed border-basetitan-border rounded-lg text-center">
                {imageSrc ? (
                    <img key={imageSrc} src={imageSrc} alt={`${side} of ID`} className="w-full h-40 object-contain rounded-md" />
                ) : (
                    <div className="h-40 flex items-center justify-center text-basetitan-text-secondary">Upload {side} view</div>
                )}
                 <div className="flex space-x-2 mt-4">
                    <button onClick={() => ref.current?.click()} className="flex-1 bg-basetitan-dark hover:bg-basetitan-border text-white text-sm font-bold py-2 px-4 rounded-md">Upload</button>
                    <button onClick={() => setShowCameraFor(side)} className="flex-1 bg-basetitan-dark hover:bg-basetitan-border text-white text-sm font-bold py-2 px-4 rounded-md">Use Camera</button>
                    <input type="file" ref={ref} onChange={(e) => handleFileChange(e, side)} accept="image/*" className="hidden" />
                </div>
            </div>
        );
    };

    return (
        <Card>
            <h2 className="text-xl font-bold text-white mb-1">Step 2: Identity Document</h2>
            <p className="text-basetitan-text-secondary text-sm mb-6">Please provide a clear image of your government-issued ID.</p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="idType" className="text-sm font-semibold text-basetitan-text-secondary">Document Type</label>
                    <select
                        name="type"
                        value={doc.type}
                        onChange={e => setDoc({...doc, type: e.target.value as any})}
                        className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"
                    >
                        <option>Driver's License</option>
                        <option>Passport</option>
                        <option>National ID</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageBox side="front" />
                    <ImageBox side="back" />
                </div>
            </div>
            {error && <p className="text-sm text-accent-danger text-center mt-4">{error}</p>}
            <div className="mt-8 flex justify-between">
                <button onClick={prevStep} className="bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-6 rounded-md">Back</button>
                <button onClick={handleNext} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-6 rounded-md">Next</button>
            </div>
        </Card>
    );
};

export default Step2IDDocument;