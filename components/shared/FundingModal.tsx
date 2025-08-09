import React, { useState } from 'react';
import Card from './Card';
import Icon from './Icon';
import { CLOSE_ICON } from '../../constants';

interface FundingModalProps {
    method: 'card' | 'bank' | 'paypal' | 'cashapp' | 'zelle' | 'btcwallet';
    onClose: () => void;
    onFund: (amount: number, method: string) => void;
}

const FundingModal: React.FC<FundingModalProps> = ({ method, onClose, onFund }) => {
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showBankInstructions, setShowBankInstructions] = useState(false);

    const handleFundClick = () => {
        setError('');
        const fundAmount = parseFloat(amount);
        if (isNaN(fundAmount) || fundAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        if (method === 'bank') {
            if (fundAmount < 1000) {
                setError('Bank transfers require a minimum of $1,000.');
                return;
            }
            setShowBankInstructions(true); // Show instructions instead of processing
            return;
        }
        
        setIsProcessing(true);
        setTimeout(() => {
            onFund(fundAmount, method.charAt(0).toUpperCase() + method.slice(1));
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(onClose, 2000);
        }, 3000);
    };

    const titleMap = {
        card: 'Fund with Card',
        bank: 'Fund with Bank Transfer',
        paypal: 'Fund with PayPal',
        cashapp: 'Fund with Cash App',
        zelle: 'Fund with Zelle',
        btcwallet: 'Fund from BTC Wallet'
    };
    const title = titleMap[method];
    
    const BankInstructions = () => (
         <>
            <h2 className="text-2xl font-bold text-white">Bank Transfer Instructions</h2>
            <div className="mt-4 p-4 bg-basetitan-dark rounded-lg border border-basetitan-border text-sm space-y-3">
                <p className="text-basetitan-text-secondary">For amounts of ${parseFloat(amount).toLocaleString()} or more, we process transfers manually for security.</p>
                <p className="text-white">Please contact our finance department at <span className="font-mono text-accent-primary">finance@basetitan.com</span> with the subject "Bank Transfer Request - ID {Math.floor(Date.now() / 1000)}" to receive the necessary bank details.</p>
                <p className="text-basetitan-text-secondary">Our team will guide you through the next steps.</p>
            </div>
            <button onClick={onClose} className="mt-6 w-full bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-3 rounded-md">
                I Understand
            </button>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center animate-fade-in p-4">
            <Card className="w-full max-w-md relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-basetitan-text-secondary hover:text-white" disabled={isProcessing || isSuccess}>
                    <Icon>{CLOSE_ICON}</Icon>
                </button>
                
                {isSuccess ? (
                    <div className="text-center p-8">
                         <div className="w-16 h-16 mx-auto bg-accent-secondary rounded-full flex items-center justify-center mb-4">
                             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Funding Successful!</h2>
                        <p className="text-basetitan-text-secondary mt-2">${parseFloat(amount).toLocaleString()} USDT has been added to your account.</p>
                    </div>
                ) : isProcessing ? (
                     <div className="text-center p-8">
                        <div className="w-16 h-16 mx-auto border-4 border-accent-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h2 className="text-2xl font-bold text-white">Processing Transaction...</h2>
                        <p className="text-basetitan-text-secondary mt-2">Please wait while we securely process your payment.</p>
                    </div>
                ) : showBankInstructions ? (
                    <BankInstructions />
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                        <p className="text-basetitan-text-secondary mt-2">Enter amount in USD to deposit as USDT.</p>
                        
                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-basetitan-text-secondary">Amount (USD)</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                            </div>
                            
                            {method === 'card' && (
                                <>
                                <div>
                                    <label className="text-sm font-semibold text-basetitan-text-secondary">Card Number</label>
                                    <input type="text" placeholder="•••• •••• •••• ••••" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                                </div>
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <label className="text-sm font-semibold text-basetitan-text-secondary">Expiry Date</label>
                                        <input type="text" placeholder="MM/YY" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-semibold text-basetitan-text-secondary">CVC</label>
                                        <input type="text" placeholder="•••" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                                    </div>
                                </div>
                                </>
                            )}
                            
                            {['paypal', 'cashapp', 'zelle'].includes(method) && (
                                 <div>
                                    <p className="text-sm p-4 bg-basetitan-dark rounded-md border border-basetitan-border">You will be redirected to {title.split(' ')[2]} to complete your transaction securely.</p>
                                </div>
                            )}

                             {error && <p className="text-sm text-accent-danger text-center">{error}</p>}
                        </div>

                        <div className="mt-6">
                            <button onClick={handleFundClick} className="w-full bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-3 rounded-md">
                                {method === 'bank' ? 'Proceed' : `Fund ${amount ? `$${amount}` : ''}`}
                            </button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default FundingModal;