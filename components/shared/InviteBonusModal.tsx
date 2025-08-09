import React, { useState } from 'react';
import Card from './Card';
import Icon from './Icon';
import { CLOSE_ICON, USERS_ICON } from '../../constants';

interface InviteBonusModalProps {
    onClose: () => void;
    referralCode: string;
}

const InviteBonusModal: React.FC<InviteBonusModalProps> = ({ onClose, referralCode }) => {
    const [copied, setCopied] = useState(false);
    const referralLink = `https://basetitan.com/signup?ref=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center animate-fade-in p-4">
            <Card className="w-full max-w-md relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-basetitan-text-secondary hover:text-white">
                    <Icon>{CLOSE_ICON}</Icon>
                </button>
                
                <div className="text-center">
                    <div className="mx-auto bg-accent-primary/10 text-accent-primary rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <Icon className="w-8 h-8">{USERS_ICON}</Icon>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Invite & Earn!</h2>
                    <p className="text-basetitan-text-secondary mt-2">Earn instant crypto bonuses when you invite friends to BitTitan.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left my-6">
                        <div className="bg-basetitan-dark p-4 rounded-lg text-center">
                            <p className="text-white font-bold text-lg">Invite 5 Friends</p>
                            <p className="text-accent-secondary font-bold text-2xl">$100</p>
                        </div>
                         <div className="bg-basetitan-dark p-4 rounded-lg text-center">
                            <p className="text-white font-bold text-lg">Invite 10 Friends</p>
                            <p className="text-accent-secondary font-bold text-2xl">$200</p>
                        </div>
                         <div className="bg-basetitan-dark p-4 rounded-lg text-center">
                            <p className="text-white font-bold text-lg">Invite 30 Friends</p>
                            <p className="text-accent-secondary font-bold text-2xl">$300</p>
                        </div>
                    </div>
                    
                    <p className="text-xs text-basetitan-text-secondary mb-4">
                        *Bonus is credited when each referred user makes their first investment of $50 or more.
                    </p>

                    <div className="flex items-center space-x-2 p-2 bg-basetitan-dark border border-basetitan-border rounded-md">
                        <input type="text" readOnly value={referralLink} className="flex-1 bg-transparent text-basetitan-text-secondary text-sm outline-none"/>
                        <button onClick={handleCopy} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-semibold py-2 px-4 rounded-md text-sm">
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>

                     <div className="mt-6">
                        <button 
                            onClick={onClose}
                            className="text-basetitan-text-secondary hover:text-white font-bold py-2 px-4 rounded-md"
                        >
                           Maybe Later
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default InviteBonusModal;