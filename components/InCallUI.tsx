
import React, { useState, useEffect } from 'react';
import type { Contact } from '../types';
import { Mic, MicOff, Volume2, Grip, Phone, UserPlus, Video } from 'lucide-react';
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
            <button onClick={onClick} className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-200 ${active ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                {icon}
            </button>
            <span className="text-sm font-medium text-white/90">{label}</span>
        </div>
    );

    return (
        <div className="h-full flex flex-col justify-between items-center text-white bg-neutral-800/70 backdrop-blur-2xl p-6">
            <div className="text-center mt-20">
                 <img 
                    src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.name.charAt(0)}&background=random&size=128`}
                    alt={contact.name}
                    className="w-32 h-32 rounded-full border-4 border-neutral-700 shadow-lg mx-auto mb-4"
                />
                <h2 className="text-4xl font-semibold">{contact.name}</h2>
                <p className="text-xl text-slate-300 mt-1">{formatDuration(duration)}</p>
            </div>
            
            <div className="w-full max-w-sm space-y-5 mb-4">
                <div className="grid grid-cols-3 gap-5">
                    <ControlButton 
                        icon={isMuted ? <MicOff size={32} /> : <Mic size={32} />} 
                        label={t('mute')}
                        onClick={() => setIsMuted(!isMuted)}
                        active={isMuted}
                    />
                    <ControlButton icon={<Grip size={32} />} label={t('keypad')} />
                    <ControlButton 
                        icon={<Volume2 size={32} />} 
                        label={t('speaker')}
                        onClick={() => setIsSpeaker(!isSpeaker)}
                        active={isSpeaker}
                    />
                    <ControlButton icon={<UserPlus size={32} />} label={'Add Call'} />
                    <ControlButton icon={<Video size={32} />} label={'FaceTime'} />
                    <ControlButton icon={<Phone size={32} />} label={t('contacts')} />
                </div>

                <button 
                    onClick={onEndCall}
                    className="w-20 h-20 mx-auto rounded-full bg-[var(--accent-red)] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-100"
                >
                    <Phone size={36} style={{ transform: 'rotate(135deg)' }}/>
                </button>
            </div>

        </div>
    );
};

export default InCallUI;