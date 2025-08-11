
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
        { name: t('keypad'), id: 'keypad', icon: Grid },
        { name: t('recents'), id: 'recents', icon: Clock },
        { name: t('contacts'), id: 'contacts', icon: User },
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
        <div className="flex flex-col items-center justify-end h-full px-8 pb-4">
            <div className="h-28 flex-grow flex items-center justify-center">
                <p className="text-5xl font-light text-white tracking-wider truncate">{number}</p>
            </div>
            <div className="grid grid-cols-3 gap-x-10 gap-y-6 my-4">
                {keypadKeys.map(({ number: num, letters }) => (
                    <button key={num} onClick={() => setNumber(number + num)} className="w-20 h-20 rounded-full bg-neutral-800 text-white flex flex-col items-center justify-center hover:bg-neutral-700 transition-colors active:bg-neutral-600">
                        <span className="text-5xl font-normal tracking-wider">{num}</span>
                        {letters && <span className="text-xs tracking-[0.2em] font-medium opacity-80">{letters}</span>}
                    </button>
                ))}
            </div>
            <div className="h-24 flex items-center justify-center relative w-full mt-2">
                {number.length > 0 ? (
                    <>
                        <button onClick={handleCall} className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center hover:scale-105 transition-transform">
                            <Phone size={40} />
                        </button>
                        <button onClick={() => setNumber(number.slice(0, -1))} className="absolute right-0 text-white p-2 rounded-full hover:bg-neutral-700">
                            <Delete size={28} />
                        </button>
                    </>
                ) : <div className="w-20 h-20" /> /* Placeholder to keep layout consistent */}
            </div>
        </div>
    );

    const Recents = () => (
        <div>
             <h1 className="text-4xl font-bold text-white p-4">{t('recents')}</h1>
             <div className="px-2">
                {recentCalls.length > 0 ? (
                    recentCalls.map((call: CallRecord) => (
                        <div key={call.id} className="p-3 flex items-center gap-4 rounded-lg border-b border-neutral-800/50">
                            <div className="w-4 flex-shrink-0">
                                {call.direction === CallDirection.MISSED && call.isNew && (
                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                                )}
                            </div>
                             <div className="flex-shrink-0 w-6 flex justify-center">
                                {call.direction === CallDirection.MISSED && <PhoneMissed className="text-red-400" size={22} />}
                                {call.direction === CallDirection.INCOMING && <ArrowDownLeft className="text-green-400" size={22} />}
                                {call.direction === CallDirection.OUTGOING && <ArrowUpRight className="text-blue-400" size={22} />}
                            </div>
                            <div className="flex-grow">
                                <p className={`font-semibold text-xl ${call.direction === CallDirection.MISSED ? 'text-red-400' : 'text-white'}`}>{call.contact.name}</p>
                                <p className="text-sm text-slate-400">mobile</p>
                            </div>
                            <p className="text-base text-slate-400">{call.timestamp}</p>
                             <button onClick={() => onPlaceCall(call.contact)} className="p-3 text-blue-400 rounded-full hover:bg-blue-500/10"><Phone size={24}/></button>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-slate-400 p-12 mt-16">
                        <Clock size={48} className="mx-auto text-slate-500 mb-2" />
                        <h3 className="font-semibold text-lg">{t('no_recents')}</h3>
                    </div>
                )}
            </div>
        </div>
    );

    const Contacts = () => (
         <div>
             <h1 className="text-4xl font-bold text-white p-4">{t('contacts')}</h1>
             <div className="px-2">
                {contacts.length > 0 ? (
                     contacts.map((contact: Contact) => (
                        <div key={contact.id} className="p-3 flex items-center gap-4 cursor-pointer hover:bg-neutral-800/60 rounded-lg" onClick={() => onPlaceCall(contact)}>
                            <img src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.name.replace(/\s/g, '+')}&background=random`} alt={contact.name} className="w-14 h-14 rounded-full"/>
                            <p className="font-semibold text-white text-xl flex-grow">{contact.name}</p>
                            <Phone size={24} className="text-green-400 opacity-60" />
                        </div>
                    ))
                ) : (
                    <div className="text-center text-slate-400 p-12 mt-16">
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
        <div className="bg-transparent text-white h-full flex flex-row">
            <nav className="w-52 flex-shrink-0 flex flex-col items-center justify-center gap-4 bg-black/20 border-r border-white/10">
                 {tabs.map(tab => {
                    const TabIcon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg w-36 h-28 transition-colors ${activeTab === tab.id ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <TabIcon size={40} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                            <span className="text-sm font-semibold">{tab.name}</span>
                        </button>
                    )
                })}
            </nav>
            <main className="flex-grow overflow-y-auto">{renderContent()}</main>
        </div>
    );
};

export default PhoneApp;
