import React, { useState, useContext } from 'react';
import Card from './Card';
import Icon from './Icon';
import { CLOSE_ICON, TRASH_ICON } from '../../constants';
import { Notification } from '../../types';
import TimeAgo from './TimeAgo';
import { AuthContext } from '../auth/AuthContext';
import ConfirmationModal from './ConfirmationModal';

interface NotificationViewModalProps {
    notification: Notification;
    onClose: () => void;
}

const NotificationViewModal: React.FC<NotificationViewModalProps> = ({ notification, onClose }) => {
    const auth = useContext(AuthContext);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const linkify = (text: string): React.ReactNode[] => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
            return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">{part}</a>;
            }
            return part;
        });
    };

    const handleConfirmDelete = () => {
        if (!auth?.user) return;
        auth.deleteNotification(auth.user.id, notification.id);
        // The parent NotificationBell's useEffect will close this modal.
        // We only need to close the confirmation modal.
        setShowDeleteConfirm(false);
    };

    const handleNavigate = () => {
        if(notification.link && auth) {
            auth.navigateTo(notification.link);
        }
        onClose();
    }

    return (
        <>
            {showDeleteConfirm && (
                <ConfirmationModal 
                    title="Delete Notification"
                    message="Are you sure you want to permanently delete this notification? This action cannot be undone."
                    confirmText="Delete"
                    onConfirm={handleConfirmDelete}
                    onClose={() => setShowDeleteConfirm(false)}
                />
            )}
            <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center animate-fade-in p-4">
                <Card className="w-full max-w-md relative animate-fade-in-up">
                    <button onClick={onClose} className="absolute top-4 right-4 text-basetitan-text-secondary hover:text-white">
                        <Icon>{CLOSE_ICON}</Icon>
                    </button>
                    
                    <h2 className="text-xl font-bold text-white mb-2">{notification.title || 'Notification'}</h2>
                    
                    <div className="my-6">
                        <p className="text-basetitan-text text-base whitespace-pre-wrap">{linkify(notification.message)}</p>
                        <p className="text-basetitan-text-secondary text-sm mt-2"><TimeAgo date={notification.date} /></p>
                    </div>
                    
                    <div className="mt-8 flex justify-between items-center">
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-accent-danger hover:opacity-80 flex items-center space-x-2 text-sm font-semibold"
                        >
                           <Icon className="w-5 h-5">{TRASH_ICON}</Icon>
                           <span>Delete</span>
                        </button>
                        <div className="space-x-4">
                           <button 
                                onClick={onClose}
                                className="bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-4 rounded-md"
                            >
                                Close
                            </button>
                            {notification.link && (
                                <button
                                    onClick={handleNavigate}
                                    className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-4 rounded-md"
                                >
                                    View Details
                                </button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
};

export default NotificationViewModal;