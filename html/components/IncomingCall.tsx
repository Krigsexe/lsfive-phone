

import React from 'react';
import type { Contact } from '../types';
import { Phone, X } from 'lucide-react';
import { useLocale } from '../i18n';

interface IncomingCallProps {
    contact: Contact;
    onAccept: () => void;
    onDecline: () => void;
}

const IncomingCall: React.FC<IncomingCallProps> = ({ contact, onAccept, onDecline }) => {
    const { t } = useLocale();

    return (
        <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-3xl z-50 flex flex-col justify-between items-center p-8 text-white">
            <div className="text-center mt-24">
                <h2 className="text-7xl font-semibold">{contact.name}</h2>
                <p className="text-3xl text-slate-300">{t('incoming_call')}</p>
            </div>

            <img 
                src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.name.charAt(0)}&background=random&size=128`}
                alt={contact.name}
                className="w-56 h-56 rounded-full border-4 border-neutral-700 shadow-lg"
            />
            
            <div className="w-full max-w-md flex justify-around items-center mb-16">
                <div className="flex flex-col items-center gap-3">
                    <button 
                        onClick={onDecline}
                        className="w-28 h-28 rounded-full bg-red-500 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-100"
                    >
                        <X size={56} />
                    </button>
                    <span className="text-xl">{t('decline')}</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                     <button 
                        onClick={onAccept}
                        className="w-28 h-28 rounded-full bg-green-500 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-100"
                    >
                        <Phone size={52} />
                    </button>
                    <span className="text-xl">{t('accept')}</span>
                </div>
            </div>
        </div>
    );
};

export default IncomingCall;