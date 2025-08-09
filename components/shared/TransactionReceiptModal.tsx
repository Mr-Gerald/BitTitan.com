import React from 'react';
import Card from './Card';
import Icon from './Icon';
import { CLOSE_ICON } from '../../constants';
import { Transaction } from '../../types';

interface TransactionReceiptModalProps {
    transaction: Transaction;
    onClose: () => void;
}

const InfoRow: React.FC<{ label: string, value: React.ReactNode, isMono?: boolean }> = ({ label, value, isMono = false }) => (
    <div className="flex justify-between py-3 border-b border-basetitan-dark">
        <p className="text-basetitan-text-secondary">{label}</p>
        <p className={`text-white text-right ${isMono ? 'font-mono' : ''}`}>{value}</p>
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

const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({ transaction, onClose }) => {
    
    const isCredit = ['Deposit', 'Profit', 'Funding', 'Referral Bonus'].includes(transaction.type);
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center animate-fade-in p-4">
            <Card className="w-full max-w-md relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-basetitan-text-secondary hover:text-white">
                    <Icon>{CLOSE_ICON}</Icon>
                </button>
                
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">Transaction Receipt</h2>
                    <p className="text-basetitan-text-secondary mt-1 text-sm">Transaction ID: <span className="font-mono">{transaction.id}</span></p>
                </div>

                <div className="mt-6 space-y-4">
                     <div className={`p-4 rounded-lg text-center ${isCredit ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        <p className="text-basetitan-text-secondary text-sm">{transaction.type}</p>
                        <p className={`text-3xl font-bold ${isCredit ? 'text-accent-secondary' : 'text-accent-danger'}`}>
                           {isCredit ? '+' : '-'}{transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })} {transaction.asset}
                        </p>
                    </div>

                    <div className="text-sm">
                        <InfoRow label="Status" value={<StatusBadge status={transaction.status} />} />
                        <InfoRow label="Date" value={transaction.date} isMono />
                        <InfoRow label="Description" value={transaction.description} />
                    </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-6 rounded-md"
                    >
                        Close
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default TransactionReceiptModal;