
import React, { useState } from 'react';
import type { Mail } from '../../types';
import { ChevronLeft, Edit, Send, Trash2, Inbox, Mail as MailIcon } from 'lucide-react';
import { useLocale } from '../../i18n';

interface MailAppProps {
    mails: Mail[];
    myEmailAddress: string;
    onSend: (data: { to: string, subject: string, body: string }) => void;
    onDelete: (mailId: string) => void;
}

type MailView = 'inbox' | 'read' | 'compose';

const MailApp: React.FC<MailAppProps> = ({ mails, myEmailAddress, onSend, onDelete }) => {
    const { t } = useLocale();
    const [view, setView] = useState<MailView>('inbox');
    const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
    
    const mailList = mails;
    
    const handleSelectMail = (mail: Mail) => {
        setSelectedMail({ ...mail, isRead: true }); // Mark as read on open
        setView('read');
    };

    const handleDeleteMail = (mailId: string) => {
        onDelete(mailId);
        setView('inbox');
    }

    const handleSendMail = (to: string, subject: string, body: string) => {
        onSend({ to, subject, body });
        setView('inbox');
    };
    
    const renderView = () => {
        switch (view) {
            case 'read':
                if (!selectedMail) return null;
                return (
                     <div className="h-full flex flex-col bg-transparent">
                        <header className="p-3 bg-neutral-900/80 backdrop-blur-xl flex items-center gap-2 sticky top-0 border-b border-neutral-800 z-10">
                            <button onClick={() => setView('inbox')} className="text-white p-2 -ml-2 rounded-full hover:bg-neutral-700">
                                <ChevronLeft size={24} />
                            </button>
                            <h2 className="flex-grow font-semibold text-lg text-white truncate">{selectedMail.subject}</h2>
                            <button onClick={() => handleDeleteMail(selectedMail.id)} className="text-white p-2 rounded-full hover:bg-neutral-700">
                                <Trash2 size={20} />
                            </button>
                        </header>
                        <div className="p-4 overflow-y-auto text-white space-y-4 bg-black/20 flex-grow">
                             <p><span className="font-semibold text-neutral-400">From:</span> {selectedMail.from}</p>
                             <p><span className="font-semibold text-neutral-400">To:</span> {myEmailAddress}</p>
                             <hr className="border-neutral-800" />
                             <p className="text-neutral-200 whitespace-pre-wrap">{selectedMail.body}</p>
                        </div>
                     </div>
                );
            case 'compose':
                return <ComposeView onSend={handleSendMail} onBack={() => setView('inbox')} />;
            case 'inbox':
            default:
                return (
                    <div className="h-full flex flex-col bg-transparent text-white">
                        <header className="p-4 flex justify-between items-center sticky top-0 bg-black/30 backdrop-blur-xl border-b border-neutral-800">
                            <h1 className="text-3xl font-bold">{t('inbox')}</h1>
                            <button onClick={() => setView('compose')} className="p-2 text-blue-400"><Edit size={24}/></button>
                        </header>
                        <ul className="flex-grow overflow-y-auto p-2 space-y-1">
                            {mailList.length > 0 ? mailList.map(mail => (
                                <li key={mail.id} onClick={() => handleSelectMail(mail)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer">
                                    {!mail.isRead && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0"></div>}
                                    <div className={`flex-grow ${mail.isRead ? 'ml-[14px]' : ''}`}>
                                        <div className="flex justify-between items-baseline">
                                            <p className={`font-semibold truncate ${mail.isRead ? 'text-neutral-300' : 'text-white'}`}>{mail.from}</p>
                                            <p className="text-xs text-neutral-500 flex-shrink-0">{mail.timestamp}</p>
                                        </div>
                                        <p className={`font-medium truncate ${mail.isRead ? 'text-neutral-400' : 'text-white'}`}>{mail.subject}</p>
                                        <p className="text-sm text-neutral-500 truncate">{mail.body}</p>
                                    </div>
                                </li>
                            )) : (
                                <div className="text-center text-neutral-500 flex flex-col items-center justify-center h-full -mt-16">
                                    <MailIcon size={64} className="mx-auto mb-4" />
                                    <p className="text-lg font-semibold">{t('no_mail')}</p>
                                </div>
                            )}
                        </ul>
                    </div>
                )
        }
    }
    
    return <div className="h-full">{renderView()}</div>
};

const ComposeView: React.FC<{onSend: (to: string, subject: string, body: string) => void, onBack: () => void}> = ({onSend, onBack}) => {
    const { t } = useLocale();
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    
    const handleSend = () => {
        if(to && subject && body) {
            onSend(to, subject, body);
        }
    }
    
    return (
        <div className="h-full flex flex-col bg-black text-white">
            <header className="p-3 flex justify-between items-center sticky top-0 bg-neutral-900 border-b border-neutral-800">
                <button onClick={onBack} className="text-blue-400 px-2 py-1">{t('cancel')}</button>
                <h2 className="font-bold text-lg">{t('compose')}</h2>
                <button onClick={handleSend} disabled={!to || !subject || !body} className="text-blue-400 font-bold px-2 py-1 disabled:text-neutral-600"><Send size={22} /></button>
            </header>
            <div className="p-3 space-y-1">
                <input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder={t('to')} className="w-full bg-transparent p-2 border-b border-neutral-800 focus:outline-none focus:border-blue-500" />
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t('subject')} className="w-full bg-transparent p-2 border-b border-neutral-800 focus:outline-none focus:border-blue-500" />
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={15} placeholder={t('mail_body')} className="w-full bg-transparent p-2 focus:outline-none" />
            </div>
        </div>
    )
}

export default MailApp;
