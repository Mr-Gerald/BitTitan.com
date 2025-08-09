import React, { useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';

const WithdrawalForm: React.FC = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;

    const [asset, setAsset] = useState<'BTC' | 'USDT' | 'ETH'>('BTC');
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!user || !auth) return;

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (amountNum > user.balances[asset]) {
            setError(`Insufficient ${asset} balance.`);
            return;
        }
        if (!address.trim()) {
            setError('Please enter a wallet address.');
            return;
        }
        if (!/^\d{6}$/.test(twoFactorCode)) {
            setError('Please enter a valid 6-digit 2FA code.');
            return;
        }

        auth.submitWithdrawalRequest({
            userId: user.id,
            userName: user.name,
            asset: asset,
            amount: amountNum,
            address: address,
            twoFactorCode: twoFactorCode
        });
        
        setStatus('success');
        // Reset form
        setAmount('');
        setAddress('');
        setTwoFactorCode('');
    };
    
    if(status === 'success') {
        return (
             <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto bg-accent-secondary rounded-full flex items-center justify-center mb-4 animate-fade-in-up">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Request Submitted</h2>
                <p className="text-basetitan-text-secondary mt-2">Your withdrawal request is pending approval. You can check its status in your transaction history.</p>
                <button onClick={() => setStatus('idle')} className="mt-6 w-full bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 rounded-md">Make Another Withdrawal</button>
            </div>
        )
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <h3 className="text-lg font-bold text-white">Withdraw Funds</h3>
            <div>
                <label className="text-sm font-semibold text-basetitan-text-secondary">Asset</label>
                <select value={asset} onChange={e => setAsset(e.target.value as 'BTC' | 'USDT' | 'ETH')} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 focus:ring-accent-primary focus:border-accent-primary">
                    <option>BTC</option>
                    <option>USDT</option>
                    <option>ETH</option>
                </select>
            </div>
            <div>
                <label className="text-sm font-semibold text-basetitan-text-secondary">Amount</label>
                <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="0.00" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 focus:ring-accent-primary focus:border-accent-primary"/>
            </div>
            <div>
                <label className="text-sm font-semibold text-basetitan-text-secondary">Recipient Address</label>
                <input value={address} onChange={e => setAddress(e.target.value)} type="text" placeholder="Enter wallet address" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 focus:ring-accent-primary focus:border-accent-primary"/>
            </div>
                <div>
                <label className="text-sm font-semibold text-basetitan-text-secondary">2FA Code</label>
                <input value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value)} type="text" placeholder="Enter 6-digit code" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 focus:ring-accent-primary focus:border-accent-primary"/>
            </div>
            {error && <p className="text-sm text-accent-danger text-center">{error}</p>}
            <button type="submit" className="w-full bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-3 rounded-md">Submit Withdrawal</button>
        </form>
    );
};

export default WithdrawalForm;