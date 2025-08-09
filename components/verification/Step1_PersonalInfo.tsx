import React, { useState } from 'react';
import Card from '../shared/Card';
import { VerificationData } from '../../types';
import { COUNTRIES } from '../../constants';

interface Step1Props {
    nextStep: (data: { personalInfo: VerificationData['personalInfo'] }) => void;
    formData?: VerificationData['personalInfo'];
}

const Step1PersonalInfo: React.FC<Step1Props> = ({ nextStep, formData }) => {
    const [info, setInfo] = useState({
        fullName: formData?.fullName || '',
        dateOfBirth: formData?.dateOfBirth || '',
        address: formData?.address || '',
        city: formData?.city || '',
        postalCode: formData?.postalCode || '',
        country: formData?.country || '',
        ssn: formData?.ssn || '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setInfo({ ...info, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        const requiredFields: (keyof typeof info)[] = ['fullName', 'dateOfBirth', 'address', 'city', 'postalCode', 'country'];
        if (info.country === 'United States') {
            requiredFields.push('ssn');
        }

        for (const field of requiredFields) {
            if (!info[field]) {
                setError('All fields are required.');
                return;
            }
        }

        setError('');
        nextStep({ personalInfo: info });
    };

    return (
        <Card>
            <h2 className="text-xl font-bold text-white mb-1">Step 1: Personal Information</h2>
            <p className="text-basetitan-text-secondary text-sm mb-6">Enter your details exactly as they appear on your official documents.</p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="fullName" className="text-sm font-semibold text-basetitan-text-secondary">Full Name</label>
                    <input type="text" name="fullName" value={info.fullName} onChange={handleChange} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                </div>
                <div>
                    <label htmlFor="dateOfBirth" className="text-sm font-semibold text-basetitan-text-secondary">Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={info.dateOfBirth} onChange={handleChange} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                </div>
                 <div>
                    <label htmlFor="address" className="text-sm font-semibold text-basetitan-text-secondary">Residential Address</label>
                    <input type="text" name="address" value={info.address} onChange={handleChange} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="city" className="text-sm font-semibold text-basetitan-text-secondary">City</label>
                        <input type="text" name="city" value={info.city} onChange={handleChange} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                    </div>
                    <div>
                        <label htmlFor="postalCode" className="text-sm font-semibold text-basetitan-text-secondary">Postal Code</label>
                        <input type="text" name="postalCode" value={info.postalCode} onChange={handleChange} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                    </div>
                </div>
                 <div>
                    <label htmlFor="country" className="text-sm font-semibold text-basetitan-text-secondary">Country</label>
                    <select name="country" value={info.country} onChange={handleChange} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 text-white">
                         <option value="" disabled>Select a country...</option>
                         {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                 {info.country === 'United States' && (
                     <div className="animate-fade-in">
                        <label htmlFor="ssn" className="text-sm font-semibold text-basetitan-text-secondary">Social Security Number (SSN)</label>
                        <input type="text" name="ssn" value={info.ssn} onChange={handleChange} placeholder="•••-••-••••" className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                    </div>
                 )}
            </div>
             {error && <p className="text-sm text-accent-danger text-center mt-4">{error}</p>}
            <div className="mt-8 flex justify-end">
                <button onClick={handleNext} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-6 rounded-md">Next</button>
            </div>
        </Card>
    );
};

export default Step1PersonalInfo;