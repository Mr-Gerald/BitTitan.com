import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { Notification } from '../../types';
import Icon from './Icon';
import { NOTIFICATION_ICON } from '../../constants';
import TimeAgo from './TimeAgo';
import NotificationViewModal from './NotificationViewModal';

const NotificationBell: React.FC = () => {
    const auth = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    if (!auth || !auth.user) return null;
    const { user, markNotificationAsRead } = auth;

    const unreadCount = user.notifications.filter(n => !n.read).length;

    const handleNotificationClick = (notif: Notification) => {
        if (!notif.read) {
            markNotificationAsRead(user.id, notif.id);
        }
        setViewingNotification(notif);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Effect to close the view modal if the underlying notification is deleted
    useEffect(() => {
        if (viewingNotification && user) {
            const stillExists = user.notifications.some(n => n.id === viewingNotification.id);
            if (!stillExists) {
                setViewingNotification(null);
            }
        }
    }, [user.notifications, viewingNotification]);

    return (
        <>
            {viewingNotification && (
                <NotificationViewModal
                    notification={viewingNotification}
                    onClose={() => setViewingNotification(null)}
                />
            )}
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsOpen(prev => !prev)} 
                    className="relative text-basetitan-text-secondary hover:text-white"
                    aria-label="Notifications"
                >
                    <Icon className="w-6 h-6">{NOTIFICATION_ICON}</Icon>
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-1 ring-basetitan-light animate-pulse"></span>
                    )}
                </button>
                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-basetitan-light border border-basetitan-border rounded-lg shadow-2xl z-20 animate-fade-in-up">
                        <div className="p-3 font-bold text-white border-b border-basetitan-border flex justify-between items-center">
                            <span>Notifications</span>
                            {unreadCount > 0 && <span className="text-xs bg-accent-primary text-white font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount}</span>}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {user.notifications.length > 0 ? (
                                user.notifications.map(notif => (
                                    <div key={notif.id} onClick={() => handleNotificationClick(notif)} className={`p-3 text-sm border-b border-basetitan-border/50 cursor-pointer hover:bg-basetitan-dark ${!notif.read ? 'bg-accent-primary/10' : ''}`}>
                                        {notif.title && <p className="font-bold text-white mb-1">{notif.title}</p>}
                                        <p className="text-basetitan-text">{notif.message}</p>
                                        <p className="text-xs text-basetitan-text-secondary mt-1">
                                            <TimeAgo date={notif.date} />
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="p-4 text-sm text-basetitan-text-secondary text-center">No new notifications.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default NotificationBell;