import React, { useState, useEffect } from 'react';
import { LiveNotificationData } from '../../types';
import Icon from './Icon';
import { NOTIFICATION_ICON, CLOSE_ICON } from '../../constants';

interface LiveNotificationProps {
    data: LiveNotificationData;
    onClose: () => void;
}

const LiveNotification: React.FC<LiveNotificationProps> = ({ data, onClose }) => {
    const [animationClass, setAnimationClass] = useState('animate-fade-in-up');

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimationClass('animate-notification-out-right'); // Custom fade-out animation
        }, 4500); // Start fade out 0.5s before it's removed

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setAnimationClass('animate-notification-out-right');
        setTimeout(onClose, 500);
    };

    // Add a custom keyframe for fading out to the right
    const customKeyframes = `
        @keyframes notification-out-right {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(100%); }
        }
        .animate-notification-out-right { animation: notification-out-right 0.5s ease-in forwards; }
    `;

    return (
        <>
            <style>{customKeyframes}</style>
            <div className={`flex items-start p-4 space-x-3 w-80 bg-basetitan-light border border-basetitan-border rounded-lg shadow-2xl ${animationClass}`}>
                <div className="flex-shrink-0 text-accent-secondary pt-1">
                    <Icon>{NOTIFICATION_ICON}</Icon>
                </div>
                <div className="flex-1">
                    <p className="font-bold text-white">Live Profit!</p>
                    <p className="text-sm text-basetitan-text-secondary">
                        Congrats! <span className="font-semibold text-basetitan-text">{data.name}</span> just profited <span className="font-bold text-accent-secondary">{data.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {data.currency}</span>.
                    </p>
                </div>
                <button onClick={handleClose} className="text-basetitan-text-secondary hover:text-white">
                    <Icon className="w-4 h-4">{CLOSE_ICON}</Icon>
                </button>
            </div>
        </>
    );
};

export default LiveNotification;