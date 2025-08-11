
import React, { ReactNode } from 'react';
import StatusBar from './StatusBar';
import type { Contact } from '../types';
import { Phone } from 'lucide-react';

interface PhoneShellProps {
    children: ReactNode;
    onHomeClick: () => void;
    callState: 'idle' | 'incoming' | 'active';
    activeCallContact: Contact | null;
    locale: 'en' | 'fr';
    wallpaperUrl: string;
}

const PhoneShell: React.FC<PhoneShellProps> = ({ children, onHomeClick, callState, activeCallContact, locale, wallpaperUrl }) => {

    return (
        <div 
            className="w-[1400px] h-[940px] rounded-[60px] shadow-2xl shadow-black/80 border-4 border-neutral-800 flex flex-col relative p-2 bg-cover bg-center"
            style={{ backgroundImage: `url('${wallpaperUrl}')` }}
        >
            <div className="relative w-full h-full bg-transparent rounded-[52px] flex flex-col overflow-hidden">
                
                <StatusBar locale={locale} />
                
                <main className="flex-grow bg-transparent overflow-y-auto">
                    {children}
                </main>
                
                {/* Home Bar */}
                <div className="h-9 flex-shrink-0 flex items-center justify-center pt-2 pb-4">
                     <button
                        onClick={onHomeClick}
                        className="w-64 h-1.5 bg-white/60 rounded-full hover:bg-white/90 transition-colors"
                        aria-label="Home"
                    ></button>
                </div>
            </div>
        </div>
    );
};

export default PhoneShell;
