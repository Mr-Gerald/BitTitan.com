import React, { useState } from 'react';
import Card from '../shared/Card';
import Icon from '../shared/Icon';
import { CLOSE_ICON } from '../../constants';
import { User } from '../../types';

interface SendFundsModalProps {
    user: User;
    onClose: () => void;
    onSend: (userId: number, asset: 'BTC' | 'USDT' | 'ETH', amount: number) => void;
}

const SendFundsModal: React.FC<SendFundsModalProps> = ({ user, onClose, onSend }) => {
    const [amount, setAmount] = useState('');
    const [asset, setAsset] = useState<'USDT' | 'BTC' | 'ETH'>('USDT');
    const [error, setError] = useState('');

    const handleSendClick = () => {
        const sendAmount = parseFloat(amount);
        if (isNaN(sendAmount) || sendAmount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }
        onSend(user.id, asset, sendAmount);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center animate-fade-in p-4">
            <Card className="w-full max-w-md relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-basetitan-text-secondary hover:text-white">
                    <Icon>{CLOSE_ICON}</Icon>
                </button>
                
                <h2 className="text-2xl font-bold text-white">Send Funds</h2>
                <p className="text-basetitan-text-secondary mt-1">Transfer funds directly to <span className="text-white font-semibold">{user.name}</span>.</p>
                
                <div className="mt-6 space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-basetitan-text-secondary">Asset</label>
                        <select
                            value={asset}
                            onChange={(e) => setAsset(e.target.value as 'USDT' | 'BTC' | 'ETH')}
                            className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 focus:ring-accent-primary focus:border-accent-primary"
                        >
                            <option value="USDT">USDT</option>
                            <option value="BTC">BTC</option>
                            <option value="ETH">ETH</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-basetitan-text-secondary">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 focus:ring-accent-primary focus:border-accent-primary"
                        />
                    </div>
                    {error && <p className="text-accent-danger text-sm mt-1">{error}</p>}
                </div>
                
                <div className="mt-6">
                    <button 
                        onClick={handleSendClick}
                        disabled={!amount}
                        className="w-full bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-3 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {amount ? `Send ${amount} ${asset}` : 'Send Funds'}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default SendFundsModal;