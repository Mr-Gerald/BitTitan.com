import React, { useState, useContext } from 'react';
import Card from '../shared/Card';
import Icon from '../shared/Icon';
import { CLOSE_ICON } from '../../constants';
import { DepositRequest } from '../../types';
import { AuthContext } from '../auth/AuthContext';

interface DepositReviewModalProps {
    request: DepositRequest;
    onClose: () => void;
    onApprove: (requestId: string) => void;
    onReject: (requestId: string, reason: string) => void;
}

const InfoRow: React.FC<{ label: string, value?: React.ReactNode, isMono?: boolean }> = ({ label, value, isMono = false }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
        <p className="text-basetitan-text-secondary col-span-1">{label}</p>
        <p className={`text-white text-right col-span-2 ${isMono ? 'font-mono' : ''} break-words`}>{value}</p>
    </div>
);

const DepositReviewModal: React.FC<DepositReviewModalProps> = ({ request, onClose, onApprove, onReject }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionForm, setShowRejectionForm] = useState(false);

    const handleReject = () => {
        if (!rejectionReason.trim()) return;
        onReject(request.id, rejectionReason);
        onClose();
    };

    const handleApprove = () => {
        onApprove(request.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center animate-fade-in p-4">
            <Card className="w-full max-w-lg relative animate-fade-in-up">
                 <button onClick={onClose} className="absolute top-4 right-4 text-basetitan-text-secondary hover:text-white">
                    <Icon>{CLOSE_ICON}</Icon>
                </button>
                
                <h2 className="text-2xl font-bold text-white mb-6">Review Deposit for {request.userName}</h2>
                
                <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
                    <section>
                        <h3 className="text-lg font-semibold text-accent-primary border-b border-basetitan-border pb-2 mb-3">Deposit Details</h3>
                        <div className="text-sm">
                            <InfoRow label="User" value={request.userName} />
                            <InfoRow label="Amount" value={`${request.amount} ${request.asset}`} isMono />
                            <InfoRow label="Date Submitted" value={request.date} />
                        </div>
                    </section>
                    
                    <section>
                         <h3 className="text-lg font-semibold text-accent-primary border-b border-basetitan-border pb-2 mb-3">Proof of Transaction</h3>
                         <div>
                            <img src={request.proofImage} alt="Deposit proof" className="rounded-lg border border-basetitan-border w-full"/>
                         </div>
                    </section>
                </div>

                <div className="mt-8 pt-4 border-t border-basetitan-border">
                    {showRejectionForm ? (
                        <div>
                            <label className="text-sm font-semibold text-basetitan-text-secondary">Reason for Rejection</label>
                            <textarea 
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"
                                placeholder="e.g., Unclear image, amount mismatch..."
                            />
                            <div className="flex justify-end space-x-4 mt-2">
                                <button onClick={() => setShowRejectionForm(false)} className="bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                                <button onClick={handleReject} disabled={!rejectionReason.trim()} className="bg-accent-danger hover:opacity-90 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50">Confirm Rejection</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-end space-x-4">
                            <button onClick={() => setShowRejectionForm(true)} className="bg-accent-danger hover:opacity-90 text-white font-bold py-2 px-6 rounded-md">Reject</button>
                            <button onClick={handleApprove} className="bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-2 px-6 rounded-md">Approve</button>
                        </div>
                    )}
                </div>

            </Card>
        </div>
    );
};

export default DepositReviewModal;