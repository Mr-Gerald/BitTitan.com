import React, { useState, useEffect } from 'react';

const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 30) return "Just now";
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };

    let counter;
    if (seconds < 60) {
        return `${seconds}s ago`;
    } else if (seconds < 3600) {
        counter = Math.floor(seconds / intervals.minute);
        return `${counter}m ago`;
    } else if (seconds < 86400) {
        counter = Math.floor(seconds / intervals.hour);
        return `${counter}h ago`;
    } else {
        counter = Math.floor(seconds / intervals.day);
        return `${counter}d ago`;
    }
};

const TimeAgo: React.FC<{ date: string }> = ({ date }) => {
    const [displayTime, setDisplayTime] = useState(() => timeAgo(new Date(date)));

    useEffect(() => {
        const dateObj = new Date(date);
        const interval = setInterval(() => {
            setDisplayTime(timeAgo(dateObj));
        }, 60000); // update every minute

        return () => clearInterval(interval);
    }, [date]);

    return <>{displayTime}</>;
};

export default TimeAgo;