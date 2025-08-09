import React from 'react';
import Card from '../shared/Card';
import { VerificationData } from '../../types';

interface Step4Props {
    submitVerification: () => void;
    prevStep: () => void;
    formData: VerificationData;
}

const InfoRow: React.FC<{ label: string, value?: React.ReactNode, isMono?: boolean }> = ({ label, value, isMono = false }) => (
    <div className="grid grid-cols-3 gap-4 py-2 border-b border-basetitan-border/50">
        <p className="text-basetitan-text-secondary col-span-1">{label}</p>
        <p className={`text-white text-right col-span-2 ${isMono ? 'font-mono' : ''} break-words`}>{value}</p>
    </div>
);

const Step4Review: React.FC<Step4Props> = ({ submitVerification, prevStep, formData }) => {
    const { personalInfo, idDocument, cardDetails } = formData;

    const maskedCardNumber = `•••• •••• •••• ${cardDetails.number.slice(-4)}`;

    return (
        <Card>
            <h2 className="text-xl font-bold text-white mb-1">Step 4: Review & Submit</h2>
            <p className="text-basetitan-text-secondary text-sm mb-6">Please confirm all your information is correct before submitting.</p>
            
            <div className="space-y-6">
                 <section>
                    <h3 className="text-lg font-semibold text-accent-primary mb-2">Personal Information</h3>
                    <div className="text-sm bg-basetitan-dark p-4 rounded-lg">
                        <InfoRow label="Full Name" value={personalInfo.fullName} />
                        <InfoRow label="Date of Birth" value={personalInfo.dateOfBirth} />
                        <InfoRow label="Address" value={`${personalInfo.address}, ${personalInfo.city}, ${personalInfo.postalCode}`} />
                        <InfoRow label="Country" value={personalInfo.country} />
                        {personalInfo.ssn && <InfoRow label="SSN" value={personalInfo.ssn} isMono />}
                    </div>
                </section>

                 <section>
                    <h3 className="text-lg font-semibold text-accent-primary mb-2">ID Document</h3>
                     <div className="text-sm bg-basetitan-dark p-4 rounded-lg">
                        <InfoRow label="Document Type" value={idDocument.type} />
                        <div className="grid grid-cols-2 gap-4 mt-2">
                             <img src={idDocument.frontImage} alt="ID Front" className="rounded-lg border border-basetitan-border w-full"/>
                             <img src={idDocument.backImage} alt="ID Back" className="rounded-lg border border-basetitan-border w-full"/>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-accent-primary mb-2">Card Details</h3>
                     <div className="text-sm bg-basetitan-dark p-4 rounded-lg">
                        <InfoRow label="Card Holder" value={cardDetails.cardHolderName} />
                        <InfoRow label="Card Number" value={maskedCardNumber} isMono />
                        <InfoRow label="Issuing Bank" value={cardDetails.issuingBank} />
                        <InfoRow label="Auto-Payment" value={cardDetails.isAutoPayment ? 'Enabled' : 'Disabled'} />
                    </div>
                </section>
            </div>
            
            <div className="mt-8 flex justify-between">
                 <button onClick={prevStep} className="bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-6 rounded-md">Back</button>
                <button onClick={submitVerification} className="bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-2 px-6 rounded-md">Confirm & Submit</button>
            </div>
        </Card>
    );
};

export default Step4Review;