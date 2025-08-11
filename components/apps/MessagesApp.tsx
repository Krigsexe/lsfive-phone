
import React, { useState } from 'react';
import type { Conversation } from '../../types';
import { ChevronLeft, Phone, Send, Paperclip, MessageCircle, ArrowUp } from 'lucide-react';
import { useLocale } from '../../i18n';

interface MessagesAppProps {
    conversations: Conversation[];
    myNumber: string;
    onViewConversation: (phoneNumber: string) => void;
}

const MessagesApp: React.FC<MessagesAppProps> = ({ conversations, myNumber, onViewConversation }) => {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const { t } = useLocale();

    const handleSelectConversation = (convo: Conversation) => {
        if (convo.unread > 0) {
            onViewConversation(convo.phoneNumber);
        }
        setSelectedConversation(convo);
    };

    const ConversationList = () => (
        <div className="h-full flex flex-col bg-transparent">
            <header className="p-4 pt-6 sticky top-0 bg-black/30 backdrop-blur-xl z-10">
                <h1 className="large-title text-white">{t('messages_title')}</h1>
            </header>
            <div className="overflow-y-auto flex-grow">
                {conversations.length > 0 ? (
                    conversations.map((convo, index) => (
                        <div
                            key={convo.phoneNumber}
                            className="p-3 flex items-center gap-3 cursor-pointer hover:bg-neutral-800/60"
                            onClick={() => handleSelectConversation(convo)}
                        >
                            <img 
                                src={convo.avatarUrl || `https://ui-avatars.com/api/?name=${convo.contactName.replace(/\s/g, '+')}&background=random`} 
                                alt={convo.contactName} 
                                className="w-12 h-12 bg-blue-500 rounded-full flex-shrink-0"
                            />
                            <div className="flex-grow overflow-hidden border-b border-neutral-800 pb-3">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-white truncate">{convo.contactName}</p>
                                    <p className="text-sm text-slate-400 flex-shrink-0">{convo.timestamp} &gt;</p>
                                </div>
                                <div className="flex justify-between items-start mt-0.5">
                                    <p className="text-sm text-slate-300 truncate">{convo.lastMessage}</p>
                                    {convo.unread > 0 && (
                                        <span className="bg-[var(--accent-blue)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ml-2 flex-shrink-0">
                                            {convo.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                     <div className="text-center text-slate-400 p-12">
                        <MessageCircle size={48} className="mx-auto text-slate-600" />
                        <p className="text-sm mt-2">{t('no_messages')}</p>
                    </div>
                )}
            </div>
        </div>
    );

    const ConversationView: React.FC<{ conversation: Conversation; onBack: () => void; }> = ({ conversation, onBack }) => (
        <div className="flex flex-col h-full bg-transparent">
            <header className="p-2 bg-black/50 backdrop-blur-xl flex items-center gap-2 sticky top-0 border-b border-neutral-800 z-10">
                 <button onClick={onBack} className="text-[var(--accent-blue)] p-2 flex items-center">
                    <ChevronLeft size={28} className="-ml-2"/>
                    <span className="text-base -ml-1">{t('messages_title')}</span>
                </button>
                <div className="flex-grow flex flex-col items-center -ml-20">
                     <img 
                        src={conversation.avatarUrl || `https://ui-avatars.com/api/?name=${conversation.contactName.replace(/\s/g, '+')}&background=random`} 
                        alt={conversation.contactName} 
                        className="w-8 h-8 bg-blue-500 rounded-full"
                    />
                    <h2 className="text-sm font-semibold text-white truncate">{conversation.contactName}</h2>
                </div>
                <button className="text-[var(--accent-blue)] p-2 rounded-full hover:bg-neutral-700">
                    <Phone size={20} />
                </button>
            </header>
            <div className="flex-grow p-3 space-y-1 overflow-y-auto">
                {conversation.messages.map((msg) => (
                    <div key={msg.id} className={`flex w-full ${msg.isSender ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3 py-2 ${msg.isSender ? 'bg-[var(--accent-blue)] text-white rounded-2xl rounded-br-md' : 'bg-neutral-800 text-white rounded-2xl rounded-bl-md'}`}>
                            <p className="break-words text-[15px]">{msg.content}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-2 bg-black/50 backdrop-blur-xl flex items-center gap-2 border-t border-neutral-800">
                <button className="p-2 text-slate-300 hover:text-white">
                    <Paperclip size={24} />
                </button>
                <div className="flex-grow bg-neutral-700/80 rounded-2xl flex items-center">
                    <input type="text" placeholder={`${t('messages_title')}`} className="flex-grow bg-transparent py-2 px-3.5 text-white focus:outline-none" />
                    <button className="p-2 mr-1 text-white bg-[var(--accent-blue)] rounded-full hover:bg-blue-600 transition-colors">
                        <ArrowUp size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-transparent text-white h-full">
            {selectedConversation
                ? <ConversationView conversation={selectedConversation} onBack={() => setSelectedConversation(null)} />
                : <ConversationList />
            }
        </div>
    );
};

export default MessagesApp;