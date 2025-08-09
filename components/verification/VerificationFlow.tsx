import React, { useState, useContext } from 'react';
import { Page, VerificationData } from '../../types';
import { AuthContext } from '../auth/AuthContext';
import Step1PersonalInfo from './Step1_PersonalInfo';
import Step2IDDocument from './Step2_IDDocument';
import Step3DebitCard from './Step3_DebitCard';
import Step4Review from './Step4_Review';

const VerificationFlow: React.FC = () => {
    const auth = useContext(AuthContext);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<VerificationData>>({});

    const nextStep = (data: any) => {
        setFormData(prev => ({ ...prev, ...data }));
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
    };

    const submitVerification = () => {
        if (auth?.user && formData.personalInfo && formData.idDocument && formData.cardDetails) {
            auth.submitVerification(auth.user.id, formData as VerificationData);
            // Navigate to account page to see pending status
            auth.navigateTo(Page.Account);
        } else {
            // Handle error, though validation should prevent this
            console.error("Incomplete verification data");
        }
    };
    
    const renderStep = () => {
        switch (step) {
            case 1:
                return <Step1PersonalInfo nextStep={nextStep} formData={formData.personalInfo} />;
            case 2:
                return <Step2IDDocument nextStep={nextStep} prevStep={prevStep} formData={formData.idDocument} />;
            case 3:
                return <Step3DebitCard nextStep={nextStep} prevStep={prevStep} formData={formData.cardDetails} />;
            case 4:
                return <Step4Review submitVerification={submitVerification} prevStep={prevStep} formData={formData as VerificationData} />;
            default:
                return <div>Unknown step</div>;
        }
    };

    const progressPercentage = (step - 1) * (100 / 3);

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Account Verification</h1>
                <p className="text-basetitan-text-secondary mt-1">Please complete the following steps to verify your identity.</p>
                <div className="mt-4 w-full bg-basetitan-light rounded-full h-2.5">
                    <div className="bg-accent-primary h-2.5 rounded-full" style={{ width: `${progressPercentage}%`, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
            </div>
            {renderStep()}
        </div>
    );
};

export default VerificationFlow;