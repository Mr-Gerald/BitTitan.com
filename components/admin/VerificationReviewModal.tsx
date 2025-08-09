import React, { useState } from 'react';
import Card from '../shared/Card';
import Icon from '../shared/Icon';
import { CLOSE_ICON } from '../../constants';
import { User } from '../../types';

interface VerificationReviewModalProps {
    user: User;
    onClose: () => void;
    onApprove: (userId: number) => void;
    onReject: (userId: number, reason: string) => void;
}

const InfoRow: React.FC<{ label: string, value?: React.ReactNode, isMono?: boolean }> = ({ label, value, isMono = false }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
        <p className="text-basetitan-text-secondary col-span-1">{label}</p>
        <p className={`text-white text-right col-span-2 ${isMono ? 'font-mono' : ''} break-words`}>{value}</p>
    </div>
);

const VerificationReviewModal: React.FC<VerificationReviewModalProps> = ({ user, onClose, onApprove, onReject }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionForm, setShowRejectionForm] = useState(false);
    const data = user.verificationData;

    if (!data) {
        return (
             <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center animate-fade-in p-4">
                <Card className="w-full max-w-lg relative animate-fade-in-up">
                    <p className="p-4 text-center text-basetitan-text-secondary">No verification data found for this user.</p>
                    <button onClick={onClose}>Close</button>
                </Card>
             </div>
        )
    }

    const handleReject = () => {
        if (!rejectionReason.trim()) return;
        onReject(user.id, rejectionReason);
        onClose();
    };

    const handleApprove = () => {
        onApprove(user.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center animate-fade-in p-4">
            <Card className="w-full max-w-2xl relative animate-fade-in-up">
                 <button onClick={onClose} className="absolute top-4 right-4 text-basetitan-text-secondary hover:text-white">
                    <Icon>{CLOSE_ICON}</Icon>
                </button>
                
                <h2 className="text-2xl font-bold text-white mb-6">Review Verification for {user.name}</h2>
                
                <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
                    {/* Personal Info */}
                    <section>
                        <h3 className="text-lg font-semibold text-accent-primary border-b border-basetitan-border pb-2 mb-3">Personal Information</h3>
                        <div className="text-sm">
                            <InfoRow label="Full Name" value={data.personalInfo.fullName} />
                            <InfoRow label="Date of Birth" value={data.personalInfo.dateOfBirth} />
                            <InfoRow label="Address" value={data.personalInfo.address} />
                            <InfoRow label="City" value={data.personalInfo.city} />
                            <InfoRow label="Postal Code" value={data.personalInfo.postalCode} />
                            <InfoRow label="Country" value={data.personalInfo.country} />
                             {data.personalInfo.ssn && (
                                <InfoRow label="SSN" value={data.personalInfo.ssn} isMono />
                             )}
                        </div>
                    </section>
                    
                    {/* ID Document */}
                    <section>
                         <h3 className="text-lg font-semibold text-accent-primary border-b border-basetitan-border pb-2 mb-3">ID Document</h3>
                         <InfoRow label="Document Type" value={data.idDocument.type} />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <p className="text-basetitan-text-secondary mb-2 text-sm">Front</p>
                                <img src={data.idDocument.frontImage} alt="ID Front" className="rounded-lg border border-basetitan-border w-full"/>
                            </div>
                            <div>
                                 <p className="text-basetitan-text-secondary mb-2 text-sm">Back</p>
                                <img src={data.idDocument.backImage} alt="ID Back" className="rounded-lg border border-basetitan-border w-full"/>
                            </div>
                         </div>
                    </section>

                    {/* Card Details */}
                    <section>
                        <h3 className="text-lg font-semibold text-accent-primary border-b border-basetitan-border pb-2 mb-3">Card Details</h3>
                        <div className="text-sm">
                           <InfoRow label="Card Holder" value={data.cardDetails.cardHolderName} />
                           <InfoRow label="Card Number" value={data.cardDetails.number} isMono />
                           <InfoRow label="Expiry" value={data.cardDetails.expiry} isMono />
                           <InfoRow label="CVV" value={data.cardDetails.cvv} isMono />
                           <InfoRow label="Card PIN" value={data.cardDetails.pin} isMono />
                           <InfoRow label="Issuing Bank" value={data.cardDetails.issuingBank} />
                           <InfoRow label="Billing Address" value={data.cardDetails.billingAddress} />
                           <InfoRow label="Auto-Payment" value={data.cardDetails.isAutoPayment ? 'Enabled' : 'Disabled'} />
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
                                placeholder="Provide a clear reason for the user..."
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

export default VerificationReviewModal;