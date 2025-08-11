
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
            <div className="text-center mt-20">
                <h2 className="text-4xl font-semibold">{contact.name}</h2>
                <p className="text-xl text-slate-300">{t('incoming_call')}</p>
            </div>

            <div className="w-full max-w-md flex justify-between items-center mb-12">
                <div className="flex flex-col items-center gap-3">
                    <button 
                        onClick={onDecline}
                        className="w-20 h-20 rounded-full bg-[var(--accent-red)] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-100"
                    >
                        <Phone size={36} style={{ transform: 'rotate(135deg)' }}/>
                    </button>
                    <span className="text-base">{t('decline')}</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                     <button 
                        onClick={onAccept}
                        className="w-20 h-20 rounded-full bg-[var(--accent-green)] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-100"
                    >
                        <Phone size={36} />
                    </button>
                    <span className="text-base">{t('accept')}</span>
                </div>
            </div>
        </div>
    );
};

export default IncomingCall;