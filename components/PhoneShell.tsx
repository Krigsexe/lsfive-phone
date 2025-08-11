
import React, { ReactNode, useState, useRef } from 'react';
import StatusBar from './StatusBar';
import QuickPanel from './QuickPanel';
import type { Contact, MusicState, Notification, PhoneSettings } from '../types';

interface PhoneShellProps {
    children: ReactNode;
    onHomeClick: () => void;
    callState: 'idle' | 'incoming' | 'active';
    activeCallContact: Contact | null;
    locale: 'en' | 'fr';
    wallpaperUrl: string;
    notifications: Notification[];
    onClearNotifications: () => void;
    musicState: MusicState;
    onTogglePlay: () => void;
    settings: PhoneSettings;
    onUpdateSettings: (updates: Partial<PhoneSettings>) => void;
}

const PhoneShell: React.FC<PhoneShellProps> = (props) => {
    const { children, onHomeClick, callState, activeCallContact, locale, wallpaperUrl } = props;
    const [isQuickPanelOpen, setIsQuickPanelOpen] = useState(false);
    const touchStartY = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.targetTouches[0].clientY < 50) { // Only track touches starting from the top 50px
            touchStartY.current = e.targetTouches[0].clientY;
        } else {
            touchStartY.current = null;
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartY.current === null) return;

        const deltaY = e.targetTouches[0].clientY - touchStartY.current;
        if (deltaY > 50 && !isQuickPanelOpen) {
            setIsQuickPanelOpen(true);
            touchStartY.current = null; // Reset after triggering
        }
    };

    return (
        <div 
            className="w-[420px] h-[900px] rounded-[60px] shadow-2xl shadow-black/80 border-4 border-neutral-800 flex flex-col relative p-1.5"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
        >
            <div 
                className="relative w-full h-full bg-cover bg-center rounded-[54px] flex flex-col overflow-hidden"
                style={{ backgroundImage: `url('${wallpaperUrl}')` }}
            >
                
                <StatusBar locale={locale} />

                {/* Dynamic Island / Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full z-20"></div>
                
                <main className="flex-grow bg-transparent overflow-y-auto" style={{ animation: 'app-view-fade-in 0.3s ease-out' }}>
                    {children}
                </main>
                
                {/* Home Bar */}
                <div className="h-9 flex-shrink-0 flex items-center justify-center pt-2 pb-4">
                     <button
                        onClick={onHomeClick}
                        className="w-36 h-[5px] bg-white/80 rounded-full hover:bg-white transition-colors"
                        aria-label="Home"
                    ></button>
                </div>
            </div>
             <QuickPanel
                isOpen={isQuickPanelOpen}
                onClose={() => setIsQuickPanelOpen(false)}
                notifications={props.notifications}
                onClearNotifications={props.onClearNotifications}
                musicState={props.musicState}
                onTogglePlay={props.onTogglePlay}
                settings={props.settings}
                onUpdateSettings={props.onUpdateSettings}
            />
        </div>
    );
};

export default PhoneShell;