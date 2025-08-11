
import React, { useState, useEffect } from 'react';
import { Clock, User, Grid, Phone, ArrowUpRight, ArrowDownLeft, PhoneMissed, Delete } from 'lucide-react';
import type { Contact, CallRecord } from '../../types';
import { CallDirection } from '../../types';
import { useLocale } from '../../i18n';

interface PhoneAppProps {
    onPlaceCall: (contact: Contact) => void;
    contacts: Contact[];
    recentCalls: CallRecord[];
    onViewRecents: () => void;
}

const keypadKeys = [
    { number: '1', letters: '' }, { number: '2', letters: 'ABC' }, { number: '3', letters: 'DEF' },
    { number: '4', letters: 'GHI' }, { number: '5', letters: 'JKL' }, { number: '6', letters: 'MNO' },
    { number: '7', letters: 'PQRS' }, { number: '8', letters: 'TUV' }, { number: '9', letters: 'WXYZ' },
    { number: '*', letters: '' }, { number: '0', letters: '+' }, { number: '#', letters: '' },
];

const PhoneApp: React.FC<PhoneAppProps> = ({ onPlaceCall, contacts, recentCalls, onViewRecents }) => {
    const { t } = useLocale();
    const tabs = [
        { name: t('recents'), id: 'recents', icon: Clock },
        { name: t('contacts'), id: 'contacts', icon: User },
        { name: t('keypad'), id: 'keypad', icon: Grid },
    ];
    const [activeTab, setActiveTab] = useState('keypad');
    const [number, setNumber] = useState('');

    useEffect(() => {
        if (activeTab === 'recents') {
            onViewRecents();
        }
    }, [activeTab, onViewRecents]);

    const handleCall = () => {
        if (number.length > 0) {
            const existingContact = contacts.find(c => c.phoneNumber === number);
            onPlaceCall(existingContact || { id: number, name: number, phoneNumber: number });
        }
    };
    
    const Keypad = () => (
        <div className="flex flex-col items-center justify-end h-full px-4 pb-4">
            <div className="h-24 flex-grow flex items-center justify-center">
                <p className="text-5xl font-light text-white tracking-wider truncate">{number}</p>
            </div>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4 my-4">
                {keypadKeys.map(({ number: num, letters }) => (
                    <button key={num} onClick={() => setNumber(number + num)} className="w-20 h-20 rounded-full bg-neutral-800/80 text-white flex flex-col items-center justify-center hover:bg-neutral-700 transition-colors active:bg-neutral-600">
                        <span className="text-4xl font-normal tracking-wider">{num}</span>
                        {letters && <span className="text-[10px] tracking-[0.15em] font-medium opacity-80">{letters}</span>}
                    </button>
                ))}
            </div>
            <div className="h-20 flex items-center justify-center relative w-full mt-1">
                {number.length > 0 ? (
                    <>
                        <button onClick={handleCall} className="w-20 h-20 rounded-full bg-[var(--accent-green)] text-white flex items-center justify-center hover:scale-105 transition-transform">
                            <Phone size={36} />
                        </button>
                        <button onClick={() => setNumber(number.slice(0, -1))} className="absolute right-8 text-white p-2 rounded-full text-lg">
                            <Delete size={28} />
                        </button>
                    </>
                ) : <div className="w-20 h-20" /> /* Placeholder */}
            </div>
        </div>
    );

    const Recents = () => (
        <div>
             <header className="p-4 pt-6 sticky top-0 bg-black/30 backdrop-blur-xl z-10">
                <h1 className="large-title text-white">{t('recents')}</h1>
            </header>
             <div className="px-2">
                {recentCalls.length > 0 ? (
                    recentCalls.map((call: CallRecord) => (
                        <div key={call.id} className="p-2 flex items-center gap-3 border-b border-neutral-800/50">
                            <div className="w-3 flex-shrink-0">
                                {call.direction === CallDirection.MISSED && call.isNew && (
                                    <div className="w-2 h-2 bg-[var(--accent-blue)] rounded-full"></div>
                                )}
                            </div>
                             <div className="flex-shrink-0 w-5 flex justify-center">
                                {call.direction === CallDirection.MISSED && <PhoneMissed className="text-[var(--accent-red)]" size={18} />}
                                {call.direction === CallDirection.INCOMING && <ArrowDownLeft className="text-neutral-400" size={18} />}
                                {call.direction === CallDirection.OUTGOING && <ArrowUpRight className="text-neutral-400" size={18} />}
                            </div>
                            <div className="flex-grow">
                                <p className={`font-semibold text-lg ${call.direction === CallDirection.MISSED ? 'text-[var(--accent-red)]' : 'text-white'}`}>{call.contact.name}</p>
                                <p className="text-xs text-slate-400">mobile</p>
                            </div>
                            <p className="text-sm text-slate-400">{call.timestamp}</p>
                             <button onClick={() => onPlaceCall(call.contact)} className="p-2 text-[var(--accent-blue)] rounded-full hover:bg-blue-500/10"><Phone size={20}/></button>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-slate-400 p-12 mt-8">
                        <Clock size={48} className="mx-auto text-slate-500 mb-2" />
                        <h3 className="font-semibold text-lg">{t('no_recents')}</h3>
                    </div>
                )}
            </div>
        </div>
    );

    const Contacts = () => (
         <div>
            <header className="p-4 pt-6 sticky top-0 bg-black/30 backdrop-blur-xl z-10">
                <h1 className="large-title text-white">{t('contacts')}</h1>
            </header>
             <div className="px-2">
                {contacts.length > 0 ? (
                     contacts.sort((a, b) => a.name.localeCompare(b.name)).map((contact: Contact) => (
                        <div key={contact.id} className="p-2 flex items-center gap-4 cursor-pointer hover:bg-neutral-800/60 rounded-lg border-b border-neutral-800/50" onClick={() => onPlaceCall(contact)}>
                            <img src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.name.replace(/\s/g, '+')}&background=random`} alt={contact.name} className="w-11 h-11 rounded-full"/>
                            <p className="font-semibold text-white text-lg flex-grow">{contact.name}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-slate-400 p-12 mt-8">
                        <User size={48} className="mx-auto text-slate-500 mb-2" />
                        <h3 className="font-semibold text-lg">{t('no_contacts')}</h3>
                    </div>
                )}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'recents': return <Recents />;
            case 'contacts': return <Contacts />;
            case 'keypad': return <Keypad />;
            default: return null;
        }
    };

    return (
        <div className="bg-transparent text-white h-full flex flex-col">
            <main className="flex-grow overflow-y-auto">{renderContent()}</main>
            <nav className="h-20 flex-shrink-0 flex items-center justify-around bg-black/40 backdrop-blur-2xl border-t border-white/10">
                 {tabs.map(tab => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center justify-center gap-1 p-1 rounded-lg w-20 h-16 transition-colors ${isActive ? 'text-[var(--accent-blue)]' : 'text-neutral-500 hover:text-neutral-200'}`}>
                            <TabIcon size={28} strokeWidth={2} fill={isActive ? 'currentColor' : 'none'} />
                            <span className="text-xs font-semibold">{tab.name}</span>
                        </button>
                    )
                })}
            </nav>
        </div>
    );
};

export default PhoneApp;