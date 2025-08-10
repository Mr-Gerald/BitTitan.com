
import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import Card from './shared/Card';
import { AuthContext } from './auth/AuthContext';
import QRCode from 'qrcode';
import { Transaction, Page, DepositRequest } from '../types';
import WithdrawalForm from './wallet/WithdrawalForm';
import TransactionReceiptModal from './shared/TransactionReceiptModal';
import CameraCapture from './shared/CameraCapture';
import { compressImage } from '../utils/imageCompressor';

const Wallet: React.FC = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const [activeTab, setActiveTab] = useState<'fund' | 'deposit' | 'withdraw'>('fund');
    const [transactionLimit, setTransactionLimit] = useState(10);
    const [copied, setCopied] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [infoModal, setInfoModal] = useState<{ isOpen: boolean; title: string; message: string; }>({ isOpen: false, title: '', message: '' });
    
    // Deposit state
    const [depositAsset, setDepositAsset] = useState<'BTC' | 'USDT'>('BTC');
    const [depositUsdAmount, setDepositUsdAmount] = useState('');
    const [depositProof, setDepositProof] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [depositError, setDepositError] = useState('');
    const [depositSuccess, setDepositSuccess] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    
    const btcAddress = 'bc1qhdty76qzwavvjwkzk6p6c324slcazm4gvcv69g';
    const usdtTrc20Address = 'TWSZhU1sp51wb8HLeX4mkAAankdzqMAo2e';
    const btcPrice = 67100; // Mock price

    const qrCodeRef = useRef<HTMLCanvasElement>(null);
    const proofUploadRef = useRef<HTMLInputElement>(null);
    const transactions = user?.transactions || [];

    const depositAddress = useMemo(() => depositAsset === 'BTC' ? btcAddress : usdtTrc20Address, [depositAsset]);

    useEffect(() => {
        if (activeTab === 'deposit' && qrCodeRef.current) {
            QRCode.toCanvas(qrCodeRef.current, depositAddress, { width: 160, margin: 2, color: { dark: '#0d1117', light: '#ffffff' } }, (error) => {
                if (error) console.error(error);
            });
        }
    }, [activeTab, depositAddress]);

    const handleCopy = () => {
        navigator.clipboard.writeText(depositAddress).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleProofFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsCompressing(true);
            setDepositError('');
            try {
                const compressedDataUrl = await compressImage(file);
                setDepositProof(compressedDataUrl);
            } catch (err) {
                setDepositError('Could not process image. Please try a different file.');
                console.error(err);
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const handleCameraCapture = async (imageDataUrl: string) => {
        setShowCamera(false);
        setIsCompressing(true);
        setDepositError('');
        try {
            const blob = await (await fetch(imageDataUrl)).blob();
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            const compressedDataUrl = await compressImage(file);
            setDepositProof(compressedDataUrl);
        } catch (err) {
            setDepositError('Could not process captured image. Please try again.');
            console.error(err);
        } finally {
            setIsCompressing(false);
        }
    };

    const cryptoAmount = useMemo(() => {
        const usd = parseFloat(depositUsdAmount);
        if (isNaN(usd) || usd <= 0) return 0;
        if (depositAsset === 'BTC') return usd / btcPrice;
        return usd; // USDT is 1:1
    }, [depositUsdAmount, depositAsset]);

    const handleSubmitDeposit = () => {
        if (!user || !auth) return;
        
        if (cryptoAmount <= 0) {
            setDepositError('Please enter a valid amount.');
            return;
        }
        if (!depositProof) {
            setDepositError('Please upload proof of your transaction.');
            return;
        }
        
        auth.submitDepositRequest({
            userId: user.id,
            asset: depositAsset,
            amount: cryptoAmount,
            proofImage: depositProof,
        });

        setDepositUsdAmount('');
        setDepositProof(null);
        setDepositError('');
        setDepositSuccess(true);
    };
    
    if (!user || !auth) return null;
    
    if (showCamera) {
        return (
             <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center animate-fade-in p-4">
                <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
            </div>
        )
    }

    const InfoModal: React.FC<{ title: string; message: string; onClose: () => void }> = ({ title, message, onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[70] flex items-center justify-center animate-fade-in p-4">
            <Card className="w-full max-w-md relative animate-fade-in-up">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-basetitan-text-secondary mt-2" dangerouslySetInnerHTML={{ __html: message }}></p>
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-6 rounded-md">OK</button>
                </div>
            </Card>
        </div>
    );

    const StatusBadge: React.FC<{ status: Transaction['status'] }> = ({ status }) => {
        const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
        const statusClasses = {
            Completed: 'bg-green-500/20 text-green-400',
            Pending: 'bg-yellow-500/20 text-yellow-400',
            Failed: 'bg-red-500/20 text-red-400',
            Rejected: 'bg-red-500/20 text-red-400',
        };
        return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
    };
    
    return (
        <div className="p-4 md:p-8 space-y-8">
             {selectedTransaction && (
                <TransactionReceiptModal 
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                />
            )}
            {infoModal.isOpen && (
                <InfoModal 
                    title={infoModal.title}
                    message={infoModal.message}
                    onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
                />
            )}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-500 text-2xl font-bold">B</div>
                    <div>
                        <p className="text-basetitan-text-secondary">Bitcoin</p>
                        <p className="text-xl font-bold text-white">{user.balances.BTC.toFixed(4)} BTC</p>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-green-500/20 rounded-full text-green-500 text-2xl font-bold">T</div>
                     <div>
                        <p className="text-basetitan-text-secondary">Tether</p>
                        <p className="text-xl font-bold text-white">{user.balances.USDT.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</p>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4">
                     <div className="p-3 bg-gray-500/20 rounded-full text-gray-400 text-2xl font-bold">E</div>
                     <div>
                        <p className="text-basetitan-text-secondary">Ethereum</p>
                        <p className="text-xl font-bold text-white">{user.balances.ETH.toFixed(2)} ETH</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex border-b border-basetitan-border">
                            <button onClick={() => setActiveTab('fund')} className={`flex-1 py-3 text-center font-semibold ${activeTab === 'fund' ? 'text-accent-primary border-b-2 border-accent-primary' : 'text-basetitan-text-secondary'}`}>
                                Fund Account
                            </button>
                            <button onClick={() => setActiveTab('deposit')} className={`flex-1 py-3 text-center font-semibold ${activeTab === 'deposit' ? 'text-accent-primary border-b-2 border-accent-primary' : 'text-basetitan-text-secondary'}`}>
                                Crypto Deposit
                            </button>
                            <button onClick={() => setActiveTab('withdraw')} className={`flex-1 py-3 text-center font-semibold ${activeTab === 'withdraw' ? 'text-accent-primary border-b-2 border-accent-primary' : 'text-basetitan-text-secondary'}`}>
                                Withdraw
                            </button>
                        </div>
                        <div className="p-6">
                            {activeTab === 'fund' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white">Fund Your Account</h3>
                                    <p className="text-sm text-basetitan-text-secondary">Add funds to your balance using approved methods.</p>
                                     <button onClick={() => setInfoModal({ isOpen: true, title: 'Bank Transfer Instructions', message: 'Please contact <b class="text-white">finance.bititan.secure@gmail.com</b> for bank transfer instructions.'})} className="w-full text-left flex items-center p-3 bg-basetitan-dark hover:bg-basetitan-border rounded-md">
                                        Bank Transfer
                                    </button>
                                    <button onClick={() => setActiveTab('deposit')} className="w-full text-left flex items-center p-3 bg-basetitan-dark hover:bg-basetitan-border rounded-md">
                                        From another Crypto Wallet
                                    </button>
                                </div>
                            )}
                            {activeTab === 'deposit' && (
                                <div className="space-y-4 text-center">
                                    {depositSuccess ? (
                                        <div className="text-center p-8">
                                            <div className="w-16 h-16 mx-auto bg-accent-secondary rounded-full flex items-center justify-center mb-4 animate-fade-in-up">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <h2 className="text-2xl font-bold text-white">Request Submitted</h2>
                                            <p className="text-basetitan-text-secondary mt-2">Your deposit is pending review. You will be notified upon approval.</p>
                                            <button onClick={() => setDepositSuccess(false)} className="mt-6 w-full bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 rounded-md">Make Another Deposit</button>
                                        </div>
                                    ) : (
                                    <>
                                    <h3 className="text-lg font-bold text-white">Deposit Crypto</h3>
                                    <div className="flex bg-basetitan-dark p-1 rounded-full">
                                        <button onClick={() => setDepositAsset('BTC')} className={`flex-1 py-1.5 text-sm rounded-full ${depositAsset === 'BTC' ? 'bg-accent-primary text-white' : 'text-basetitan-text-secondary'}`}>BTC</button>
                                        <button onClick={() => setDepositAsset('USDT')} className={`flex-1 py-1.5 text-sm rounded-full ${depositAsset === 'USDT' ? 'bg-accent-primary text-white' : 'text-basetitan-text-secondary'}`}>USDT</button>
                                    </div>
                                    <p className="text-basetitan-text-secondary text-sm">1. Send {depositAsset} {depositAsset === 'USDT' ? '(TRC20)' : ''} to the address below. <br/> 2. Enter amount sent and upload proof.</p>
                                    <div className="bg-white p-2 rounded-lg inline-block">
                                        <canvas ref={qrCodeRef} className="w-40 h-40" />
                                    </div>
                                    <div className="bg-basetitan-dark p-3 rounded-md border border-basetitan-border">
                                        <p className="text-sm font-mono break-all">{depositAddress}</p>
                                    </div>
                                    <button onClick={handleCopy} className="w-full bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-4 rounded-md">
                                        {copied ? 'Copied!' : 'Copy Address'}
                                    </button>
                                    
                                    <div className="mt-4 pt-4 border-t border-basetitan-border text-left space-y-4">
                                         <div>
                                            <label className="text-sm font-semibold text-basetitan-text-secondary">Amount Sent (in USD)</label>
                                            <input value={depositUsdAmount} onChange={e => setDepositUsdAmount(e.target.value)} type="number" placeholder="1000.00" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                                            {cryptoAmount > 0 && (
                                                <p className="text-xs text-basetitan-text-secondary text-center mt-1">≈ {cryptoAmount.toFixed(8)} {depositAsset}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-basetitan-text-secondary">Transaction Proof</label>
                                            {depositProof ? (
                                                <div className="mt-1">
                                                    <img src={depositProof} alt="Deposit proof" className="rounded-lg border border-basetitan-border max-h-48 mx-auto" />
                                                    <button onClick={() => setDepositProof(null)} className="text-xs text-accent-danger mt-1">Remove</button>
                                                </div>
                                            ) : (
                                                <div className="flex space-x-2 mt-1">
                                                    <button onClick={() => proofUploadRef.current?.click()} className="flex-1 bg-basetitan-dark hover:bg-basetitan-border text-white text-sm font-bold py-2 px-4 rounded-md">Upload File</button>
                                                    <button onClick={() => setShowCamera(true)} className="flex-1 bg-basetitan-dark hover:bg-basetitan-border text-white text-sm font-bold py-2 px-4 rounded-md">Take Photo</button>
                                                    <input type="file" ref={proofUploadRef} onChange={handleProofFileChange} accept="image/*" className="hidden" />
                                                </div>
                                            )}
                                        </div>
                                        {isCompressing && <p className="text-sm text-accent-primary text-center animate-pulse">Processing image...</p>}
                                        {depositError && <p className="text-sm text-accent-danger text-center">{depositError}</p>}
                                        <button onClick={handleSubmitDeposit} disabled={!depositUsdAmount || !depositProof || isCompressing} className="w-full bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                            Submit for Review
                                        </button>
                                    </div>
                                    </>
                                    )}
                                </div>
                            )}
                            {activeTab === 'withdraw' && (
                                <>
                                    {user.verificationStatus === 'Verified' ? (
                                        <WithdrawalForm />
                                    ) : (
                                        <div className="text-center p-6 bg-basetitan-dark rounded-lg">
                                            <h3 className="font-bold text-lg text-white">Verification Required</h3>
                                            <p className="text-basetitan-text-secondary mt-2 text-sm">You must verify your account before you can make a withdrawal.</p>
                                            <button 
                                                onClick={() => auth.navigateTo(Page.Verification)}
                                                className="mt-4 bg-accent-primary hover:bg-accent-primary-hover font-bold text-white py-2 px-5 rounded-md"
                                            >
                                                Verify Now
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-3">
                    <Card>
                        <h3 className="text-lg font-bold text-white mb-4">Transaction History</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-basetitan-text-secondary uppercase bg-basetitan-dark">
                                    <tr>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                        <th className="px-4 py-3 hidden md:table-cell">Date</th>
                                        <th className="px-4 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.slice(0, transactionLimit).map(tx => (
                                        <tr key={tx.id} className="border-b border-basetitan-border hover:bg-basetitan-dark cursor-pointer" onClick={() => setSelectedTransaction(tx)}>
                                            <td className="px-4 py-3 font-semibold">{tx.type}</td>
                                            <td className="px-4 py-3 break-words">{tx.description}</td>
                                            <td className={`px-4 py-3 font-mono text-right ${['Deposit', 'Profit', 'Funding', 'Referral Bonus'].includes(tx.type) ? 'text-accent-secondary' : 'text-accent-danger'}`}>
                                                {['Deposit', 'Profit', 'Funding', 'Referral Bonus'].includes(tx.type) ? '+' : '-'}{tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})} {tx.asset}
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">{tx.date}</td>
                                            <td className="px-4 py-3 text-right">
                                                <StatusBadge status={tx.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {transactionLimit < transactions.length && (
                             <div className="text-center mt-4">
                                <button onClick={() => setTransactionLimit(transactions.length)} className="text-accent-primary hover:underline text-sm font-semibold">
                                    See More
                                </button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Wallet;