import React, { useState, useMemo, useEffect } from 'react';
import Card from './Card';
import Icon from './Icon';
import { CLOSE_ICON } from '../../constants';
import { InvestmentPlan, User } from '../../types';

interface InvestmentModalProps {
    plan: InvestmentPlan;
    balances: User['balances'];
    onInvest: (amount: number, asset: 'BTC' | 'USDT' | 'ETH') => void;
    onClose: () => void;
    onSuccessNavigation: () => void;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ plan, balances, onInvest, onClose, onSuccessNavigation }) => {
    const [amount, setAmount] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<'USDT' | 'BTC' | 'ETH'>('USDT');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [investmentDetails, setInvestmentDetails] = useState({ amount: 0, profit: 0, asset: selectedAsset });

    // For USD conversion toggle and validation
    const [inputMode, setInputMode] = useState<'ASSET' | 'USD'>('ASSET');
    const btcPrice = 67100;
    const ethPrice = 3500;

    // Reset input mode if asset is not BTC
    useEffect(() => {
        if (selectedAsset !== 'BTC') {
            setInputMode('ASSET');
        }
    }, [selectedAsset]);

    // Calculate the final investment amount in the selected asset (e.g. BTC, ETH, USDT)
    const amountInAsset = useMemo(() => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) return 0;

        if (selectedAsset === 'BTC' && inputMode === 'USD') {
            return numericAmount / btcPrice;
        }
        return numericAmount;
    }, [amount, selectedAsset, inputMode, btcPrice]);


    const balance = balances[selectedAsset];
    const estimatedProfit = amountInAsset > 0 ? (amountInAsset * (plan.profitMultiplier - 1)) : 0;
    const potentialTotalReturn = amountInAsset > 0 ? (amountInAsset * plan.profitMultiplier) : 0;
    
    const minInvestValue = parseFloat(plan.minInvest.split(' ')[0].replace(/,/g, ''));
    const maxInvestValue = parseFloat(plan.maxInvest.split(' ')[0].replace(/,/g, ''));
    
    const handleInvestClick = () => {
        if (amountInAsset <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        let amountInUSD;
        if (selectedAsset === 'BTC') {
            amountInUSD = amountInAsset * btcPrice;
        } else if (selectedAsset === 'ETH') {
            amountInUSD = amountInAsset * ethPrice;
        } else {
            amountInUSD = amountInAsset;
        }

        if (amountInUSD < minInvestValue) {
            setError(`Minimum investment is ${minInvestValue} USDT (or equivalent).`);
            return;
        }

        if (!isNaN(maxInvestValue) && amountInUSD > maxInvestValue) {
            setError(`Maximum investment for this plan is ${maxInvestValue} USDT (or equivalent).`);
            return;
        }

        if (amountInAsset > balance) {
            setError(`Insufficient ${selectedAsset} balance.`);
            return;
        }

        setError('');
        setIsProcessing(true);
        setInvestmentDetails({ amount: amountInAsset, profit: estimatedProfit, asset: selectedAsset });

        setTimeout(() => {
            onInvest(amountInAsset, selectedAsset);
            setIsProcessing(false);
            setIsSuccess(true);
        }, 1500);
    };

    const handleViewHistory = () => {
        onClose();
        onSuccessNavigation();
    };

    const AssetSelector: React.FC = () => (
        <div className="flex justify-center space-x-2 my-4">
            {(['USDT', 'BTC', 'ETH'] as const).map(asset => (
                <button
                    key={asset}
                    onClick={() => {
                        setSelectedAsset(asset);
                        setError('');
                        setAmount('');
                    }}
                    className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all ${
                        selectedAsset === asset
                            ? 'bg-accent-primary border-accent-primary text-white'
                            : 'bg-basetitan-dark border-basetitan-border text-basetitan-text-secondary hover:border-accent-primary'
                    }`}
                >
                    {asset}
                </button>
            ))}
        </div>
    );

    const ProofOfInvestment = () => (
        <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto bg-accent-secondary rounded-full flex items-center justify-center mb-4 animate-fade-in-up">
                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Investment Confirmed</h2>
            <p className="text-basetitan-text-secondary mt-2">Your investment is now active. You can track its status in your history.</p>
            <Card className="text-left mt-6 bg-basetitan-dark">
                <h3 className="font-bold text-white mb-4">Proof of Investment</h3>
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-basetitan-text-secondary">Plan:</span> <span className="font-mono text-white">{plan.name}</span></div>
                    <div className="flex justify-between"><span className="text-basetitan-text-secondary">Amount Invested:</span> <span className="font-mono text-white">{investmentDetails.amount.toFixed(8)} {investmentDetails.asset}</span></div>
                    <div className="flex justify-between"><span className="text-basetitan-text-secondary">Potential Return:</span> <span className="font-mono text-accent-secondary">~{(investmentDetails.amount + investmentDetails.profit).toFixed(8)} {investmentDetails.asset}</span></div>
                    <div className="flex justify-between"><span className="text-basetitan-text-secondary">Status:</span> <span className="font-mono text-yellow-400">Active</span></div>
                </div>
            </Card>
            <button onClick={handleViewHistory} className="mt-6 w-full bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 rounded-md">View in History</button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center animate-fade-in p-4">
            <Card className="w-full max-w-md relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-basetitan-text-secondary hover:text-white" disabled={isProcessing}>
                    <Icon>{CLOSE_ICON}</Icon>
                </button>
                
                {isSuccess ? (
                    <ProofOfInvestment />
                ) : isProcessing ? (
                    <div className="text-center p-8">
                        <div className="w-16 h-16 mx-auto border-4 border-accent-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h2 className="text-2xl font-bold text-white">Securing Your Investment...</h2>
                        <p className="text-basetitan-text-secondary mt-2">Your funds are being allocated to the {plan.name} plan. Please wait.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-white">Invest in {plan.name}</h2>
                        <p className="text-basetitan-text-secondary mt-2 text-center">Select an asset to invest.</p>
                        
                        <AssetSelector />

                        <div className="mt-4">
                             <label className="text-sm font-semibold text-basetitan-text-secondary flex justify-between items-center">
                                <span>Amount</span>
                                <span>Balance: {balance.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 8})} {selectedAsset}</span>
                            </label>
                            
                            {selectedAsset === 'BTC' && (
                                <div className="flex items-center justify-center space-x-2 my-2">
                                    <span className={`text-sm font-semibold ${inputMode === 'ASSET' ? 'text-white' : 'text-basetitan-text-secondary'}`}>BTC</span>
                                    <button
                                        type="button"
                                        onClick={() => setInputMode(prev => prev === 'ASSET' ? 'USD' : 'ASSET')}
                                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-basetitan-dark border border-basetitan-border"
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-accent-primary transition ${inputMode === 'ASSET' ? 'translate-x-1' : 'translate-x-6'}`}
                                        />
                                    </button>
                                    <span className={`text-sm font-semibold ${inputMode === 'USD' ? 'text-white' : 'text-basetitan-text-secondary'}`}>USD</span>
                                </div>
                            )}

                            <div className="relative mt-1">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-3 focus:ring-accent-primary focus:border-accent-primary text-xl"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-basetitan-text-secondary font-semibold">
                                    {selectedAsset === 'BTC' && inputMode === 'USD' ? 'USD' : selectedAsset}
                                </span>
                            </div>
                            
                            {selectedAsset === 'BTC' && inputMode === 'USD' && parseFloat(amount) > 0 && (
                                <p className="text-xs text-basetitan-text-secondary text-center mt-2">
                                    ≈ {(parseFloat(amount) / btcPrice).toFixed(8)} BTC
                                </p>
                            )}

                            {error && <p className="text-accent-danger text-sm mt-2">{error}</p>}
                        </div>
                        
                        {amountInAsset > 0 && (
                             <div className="mt-4 p-3 bg-basetitan-dark rounded-md text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-basetitan-text-secondary">Estimated Profit:</span>
                                    <span className="font-mono text-accent-secondary">+{estimatedProfit.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 8})} {selectedAsset}</span>
                                </div>
                                <div className="flex justify-between border-t border-basetitan-border pt-2 mt-1">
                                    <span className="text-basetitan-text-secondary font-bold">Total Return:</span>
                                    <span className="font-mono text-white font-bold">{potentialTotalReturn.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 8})} {selectedAsset}</span>
                                </div>
                            </div>
                        )}

                        <div className="mt-6">
                            <button 
                                onClick={handleInvestClick} 
                                className="w-full bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-3 rounded-md transition-all disabled:bg-gray-600"
                                disabled={!amount}
                            >
                                Confirm Investment
                            </button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default InvestmentModal;