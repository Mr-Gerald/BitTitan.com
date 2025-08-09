import React from 'react';
import Card from './Card';
import Icon from './Icon';
import { CLOSE_ICON } from '../../constants';

interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    title,
    message,
    onConfirm,
    onClose,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center animate-fade-in p-4">
            <Card className="w-full max-w-md relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-basetitan-text-secondary hover:text-white">
                    <Icon>{CLOSE_ICON}</Icon>
                </button>
                
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-basetitan-text-secondary mt-2">{message}</p>
                
                <div className="mt-6 flex justify-end space-x-4">
                    <button 
                        onClick={onClose}
                        className="bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-4 rounded-md"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-4 rounded-md"
                    >
                        {confirmText}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default ConfirmationModal;