import React, { useState, useContext, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { AuthContext } from '../auth/AuthContext';
import Card from './Card';
import Icon from './Icon';
import { CLOSE_ICON } from '../../constants';

interface Enable2FAModalProps {
    userId: number;
    onClose: () => void;
}

const Enable2FAModal: React.FC<Enable2FAModalProps> = ({ userId, onClose }) => {
    const auth = useContext(AuthContext);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const qrCodeRef = useRef<HTMLCanvasElement>(null);
    const user = auth?.users.find(u => u.id === userId);

    // Dummy data for QR code generation
    const otpAuthUrl = `otpauth://totp/BitTitan:${user?.email}?secret=JBSWY3DPEHPK3PXP&issuer=BitTitan`;

    useEffect(() => {
        if (qrCodeRef.current) {
            QRCode.toCanvas(qrCodeRef.current, otpAuthUrl, { width: 180, margin: 2, color: { dark: '#0d1117', light: '#ffffff' } }, (err) => {
                if (err) console.error(err);
            });
        }
    }, [otpAuthUrl]);


    const handleEnable = () => {
        setError('');
        setSuccess('');

        if (!/^\d{6}$/.test(code)) {
            setError('Please enter a valid 6-digit code from your authenticator app.');
            return;
        }

        const result = auth?.toggle2FA(userId, code);
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
                
                <h2 className="text-2xl font-bold text-white mb-2">Enable Two-Factor Authentication</h2>
                <p className="text-basetitan-text-secondary text-sm mb-6">Scan the QR code with your authenticator app (e.g., Google Authenticator) and enter the code to verify.</p>
                
                <div className="text-center bg-white p-2 rounded-lg inline-block mx-auto">
                    <canvas ref={qrCodeRef} />
                </div>
                
                <div className="space-y-4 mt-6">
                     <div>
                        <label className="text-sm font-semibold text-basetitan-text-secondary">Verification Code</label>
                        <input type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0,6))}
                            placeholder="6-digit code"
                            className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 text-center text-lg tracking-[0.5em]"/>
                    </div>
                </div>

                {error && <p className="text-sm text-accent-danger text-center mt-4">{error}</p>}
                {success && <p className="text-sm text-accent-secondary text-center mt-4">{success}</p>}

                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={onClose} className="bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                    <button onClick={handleEnable} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-4 rounded-md">Enable 2FA</button>
                </div>
            </Card>
        </div>
    );
};

export default Enable2FAModal;
