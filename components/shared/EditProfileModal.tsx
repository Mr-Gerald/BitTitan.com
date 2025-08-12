import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { User } from '../../types';
import Card from './Card';
import Icon from './Icon';
import { CLOSE_ICON } from '../../constants';
import CameraCapture from './CameraCapture';
import { compressImage } from '../../utils/imageCompressor';

interface EditProfileModalProps {
    user: User;
    onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose }) => {
    const auth = useContext(AuthContext);
    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState<string | null>(user.avatarUrl);
    const [phone, setPhone] = useState(user.phone || '');
    const [country, setCountry] = useState(user.country || '');
    const [bio, setBio] = useState(user.bio || '');

    const [isCompressing, setIsCompressing] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsCompressing(true);
            try {
                const compressedDataUrl = await compressImage(file);
                setAvatar(compressedDataUrl);
            } catch (err) {
                console.error("Error compressing avatar:", err);
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const handleCameraCapture = async (imageDataUrl: string) => {
        setShowCamera(false);
        setIsCompressing(true);
        try {
            const blob = await (await fetch(imageDataUrl)).blob();
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            const compressedDataUrl = await compressImage(file);
            setAvatar(compressedDataUrl);
        } catch (err) {
            console.error("Error compressing avatar from camera:", err);
        } finally {
            setIsCompressing(false);
        }
    };

    const handleSave = () => {
        if (!auth || isCompressing) return;
        auth.updateUserProfile(user.id, {
            name,
            avatarUrl: avatar || '',
            phone,
            country,
            bio,
        });
        onClose();
    };

    if (showCamera) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center animate-fade-in p-4">
                <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center animate-fade-in p-4">
            <Card className="w-full max-w-lg relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-basetitan-text-secondary hover:text-white">
                    <Icon>{CLOSE_ICON}</Icon>
                </button>
                
                <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="flex items-center space-x-4">
                         {avatar ? (
                            <img src={avatar} alt="Avatar Preview" className="w-24 h-24 rounded-full border-4 border-basetitan-border object-cover" />
                        ) : (
                            <div className="w-24 h-24 rounded-full border-4 border-basetitan-border bg-accent-primary flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                                <span>{name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}</span>
                            </div>
                        )}
                        <div className="space-y-2">
                             <button onClick={() => fileInputRef.current?.click()} className="w-full bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-4 rounded-md text-sm">Upload File</button>
                             <button onClick={() => setShowCamera(true)} className="w-full bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-4 rounded-md text-sm">Take Photo</button>
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                    </div>
                    
                    {isCompressing && <p className="text-sm text-accent-primary text-center animate-pulse">Processing image...</p>}

                    <div>
                        <label htmlFor="name" className="text-sm font-semibold text-basetitan-text-secondary">Username</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 focus:ring-accent-primary focus:border-accent-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="text-sm font-semibold text-basetitan-text-secondary">Phone Number</label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 focus:ring-accent-primary focus:border-accent-primary"
                            placeholder="e.g., +1-555-555-5555"
                        />
                    </div>
                     <div>
                        <label htmlFor="country" className="text-sm font-semibold text-basetitan-text-secondary">Country</label>
                        <input
                            id="country"
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 focus:ring-accent-primary focus:border-accent-primary"
                            placeholder="e.g., United States"
                        />
                    </div>
                     <div>
                        <label htmlFor="bio" className="text-sm font-semibold text-basetitan-text-secondary">Bio</label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 focus:ring-accent-primary focus:border-accent-primary h-24"
                            placeholder="Tell us a little about yourself..."
                        />
                    </div>
                     <div>
                        <label htmlFor="email" className="text-sm font-semibold text-basetitan-text-secondary">Email (cannot be changed)</label>
                        <input
                            id="email"
                            type="email"
                            value={user.email}
                            disabled
                            className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 text-basetitan-text-secondary cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={onClose} className="bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                    <button onClick={handleSave} disabled={isCompressing} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-4 rounded-md disabled:opacity-50">Save Changes</button>
                </div>
            </Card>
        </div>
    );
};

export default EditProfileModal;