import React, { useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import Card from './Card';
import Icon from './Icon';
import { CLOSE_ICON } from '../../constants';

interface ChangePasswordModalProps {
    userId: number;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ userId, onClose }) => {
    const auth = useContext(AuthContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSave = () => {
        setError('');
        setSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long.');
            return;
        }

        const result = auth?.changePassword(userId, currentPassword, newPassword);
        if (result?.success) {
            setSuccess(result.message);
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            setError(result?.message || 'An unknown error occurred.');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center animate-fade-in p-4">
            <Card className="w-full max-w-md relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-basetitan-text-secondary hover:text-white">
                    <Icon>{CLOSE_ICON}</Icon>
                </button>
                
                <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
                
                <div className="space-y-4">
                     <div>
                        <label className="text-sm font-semibold text-basetitan-text-secondary">Current Password</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                            className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-basetitan-text-secondary">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-basetitan-text-secondary">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                    </div>
                </div>

                {error && <p className="text-sm text-accent-danger text-center mt-4">{error}</p>}
                {success && <p className="text-sm text-accent-secondary text-center mt-4">{success}</p>}

                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={onClose} className="bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                    <button onClick={handleSave} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-4 rounded-md">Save Changes</button>
                </div>
            </Card>
        </div>
    );
};

export default ChangePasswordModal;
