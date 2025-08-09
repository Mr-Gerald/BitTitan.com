import React, { useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import Card from '../shared/Card';
import Icon from '../shared/Icon';
import { CLOSE_ICON } from '../../constants';
import { User } from '../../types';

interface SendMessageModalProps {
    user: User;
    onClose: () => void;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({ user, onClose }) => {
    const auth = useContext(AuthContext);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleSend = () => {
        if (!message.trim()) {
            setError('Message cannot be empty.');
            return;
        }
        setError('');
        auth?.sendAdminMessage(user.id, message);
        setIsSent(true);
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center animate-fade-in p-4">
            <Card className="w-full max-w-lg relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-basetitan-text-secondary hover:text-white">
                    <Icon>{CLOSE_ICON}</Icon>
                </button>
                
                <h2 className="text-2xl font-bold text-white mb-2">Send Message</h2>
                <p className="text-basetitan-text-secondary">Your message will be sent as a notification to <span className="text-white font-semibold">{user.name}</span>.</p>
                
                {isSent ? (
                     <div className="h-full flex flex-col items-center justify-center bg-basetitan-dark rounded-lg p-8 text-center animate-fade-in mt-6">
                        <div className="w-16 h-16 mx-auto bg-accent-secondary rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-white">Message Sent!</h3>
                    </div>
                ) : (
                    <>
                        <div className="mt-6">
                            <label htmlFor="message" className="text-sm font-semibold text-basetitan-text-secondary">Message Content</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 h-32 focus:ring-accent-primary focus:border-accent-primary"
                                placeholder={`Type your message to ${user.name}. You can include links like https://example.com.`}
                            />
                        </div>

                        {error && <p className="text-sm text-accent-danger text-center mt-4">{error}</p>}

                        <div className="mt-6 flex justify-end space-x-4">
                            <button onClick={onClose} className="bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                            <button onClick={handleSend} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-4 rounded-md">Send Message</button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default SendMessageModal;