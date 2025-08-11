
import React, { useState, useEffect } from 'react';
import type { Contact } from '../types';
import { Mic, MicOff, Volume2, Grip, Phone } from 'lucide-react';
import { useLocale } from '../i18n';

interface InCallUIProps {
    contact: Contact;
    onEndCall: () => void;
}

const InCallUI: React.FC<InCallUIProps> = ({ contact, onEndCall }) => {
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(false);
    const { t } = useLocale();

    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const ControlButton: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void, active?: boolean }> = ({ icon, label, onClick, active }) => (
        <div className="flex flex-col items-center gap-2">
            <button onClick={onClick} className={`w-28 h-28 rounded-full flex items-center justify-center transition-colors duration-200 ${active ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {icon}
            </button>
            <span className="text-lg font-medium text-white/90">{label}</span>
        </div>
    );

    return (
        <div className="h-full flex flex-col justify-between items-center text-white bg-black/70 backdrop-blur-2xl p-8">
            <div className="text-center mt-28">
                <h2 className="text-7xl font-semibold">{contact.name}</h2>
                <p className="text-3xl text-slate-300 mt-2">{formatDuration(duration)}</p>
            </div>
            
            <div className="w-full max-w-lg grid grid-cols-3 gap-5 mb-16">
                <ControlButton 
                    icon={isMuted ? <MicOff size={48} /> : <Mic size={48} />} 
                    label={t('mute')}
                    onClick={() => setIsMuted(!isMuted)}
                    active={isMuted}
                />
                <ControlButton icon={<Grip size={48} />} label={t('keypad')} />
                <ControlButton 
                    icon={<Volume2 size={48} />} 
                    label={t('speaker')}
                    onClick={() => setIsSpeaker(!isSpeaker)}
                    active={isSpeaker}
                />
            </div>

            <button 
                onClick={onEndCall}
                className="w-28 h-28 rounded-full bg-red-500 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-100"
            >
                <Phone size={52} />
            </button>
        </div>
    );
};

export default InCallUI;