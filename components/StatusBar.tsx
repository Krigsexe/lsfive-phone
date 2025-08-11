
import React, { useState, useEffect } from 'react';
import { Wifi, Signal, BatteryFull } from 'lucide-react';

interface StatusBarProps {
    locale: 'en' | 'fr';
}

const StatusBar: React.FC<StatusBarProps> = ({ locale }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timerId);
    }, []);

    const formatTime = (date: Date) => {
        const timeZone = locale === 'fr' ? 'Europe/Paris' : 'America/Los_Angeles';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone });
    };

    return (
        <header className="h-12 px-8 flex justify-between items-center text-white flex-shrink-0 z-10 relative">
            <div className="text-sm font-semibold w-12 text-left">
                {formatTime(time)}
            </div>
            <div className="flex items-center gap-2">
                <Signal size={16} />
                <Wifi size={16} />
                <BatteryFull size={20} />
            </div>
        </header>
    );
};

export default StatusBar;