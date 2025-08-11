
import React, { useState } from 'react';
import type { Conversation } from '../../types';
import { ChevronLeft, Phone, Send, Paperclip, MessageCircle } from 'lucide-react';
import { useLocale } from '../../i18n';

interface MessagesAppProps {
    conversations: Conversation[];
    myNumber: string; // Keep for potential future use, e.g. sending new messages
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
            <header className="p-4 sticky top-0 bg-black/30 backdrop-blur-xl border-b border-neutral-800">
                <h1 className="text-3xl font-bold text-white">{t('messages_title')}</h1>
            </header>
            <div className="overflow-y-auto flex-grow">
                {conversations.length > 0 ? (
                    conversations.map((convo) => (
                    <div
                        key={convo.phoneNumber}
                        className={`p-3 flex items-center gap-4 cursor-pointer hover:bg-neutral-800/60 ${selectedConversation?.phoneNumber === convo.phoneNumber ? 'bg-blue-500/20' : ''}`}
                        onClick={() => handleSelectConversation(convo)}
                    >
                        <img 
                            src={convo.avatarUrl || `https://ui-avatars.com/api/?name=${convo.contactName.replace(/\s/g, '+')}&background=random`} 
                            alt={convo.contactName} 
                            className="w-12 h-12 bg-blue-500 rounded-full flex-shrink-0"
                        />
                        <div className="flex-grow overflow-hidden">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-white truncate">{convo.contactName}</p>
                                <p className="text-xs text-slate-400 flex-shrink-0">{convo.timestamp}</p>
                            </div>
                            <div className="flex justify-between items-start mt-0.5">
                                <p className="text-sm text-slate-300 truncate">{convo.lastMessage}</p>
                                {convo.unread > 0 && (
                                    <span className="bg-blue-500 text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full ml-2 flex-shrink-0">
                                        {convo.unread}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))
                ) : (
                     <div className="text-center text-slate-400 p-12">
                        <p className="text-sm">{t('no_messages')}</p>
                    </div>
                )}
            </div>
        </div>
    );

    const ConversationView: React.FC<{ conversation: Conversation; onBack?: () => void; isTwoPane?: boolean }> = ({ conversation, onBack, isTwoPane = false }) => (
        <div className="flex flex-col h-full bg-transparent">
            <header className="p-3 bg-black/50 backdrop-blur-xl flex items-center gap-2 sticky top-0 border-b border-neutral-800 z-10">
                {!isTwoPane && onBack && (
                     <button onClick={onBack} className="text-white p-2 rounded-full hover:bg-neutral-700">
                        <ChevronLeft size={24} />
                    </button>
                )}
                 <img 
                    src={conversation.avatarUrl || `https://ui-avatars.com/api/?name=${conversation.contactName.replace(/\s/g, '+')}&background=random`} 
                    alt={conversation.contactName} 
                    className="w-9 h-9 bg-blue-500 rounded-full"
                />
                <div className="flex-grow">
                    <h2 className="text-base font-semibold text-white">{conversation.contactName}</h2>
                </div>
                <button className="text-white p-2 rounded-full hover:bg-neutral-700">
                    <Phone size={20} />
                </button>
            </header>
            <div className="flex-grow p-4 space-y-2 overflow-y-auto">
                {conversation.messages.map((msg) => (
                    <div key={msg.id} className={`flex w-full ${msg.isSender ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 text-white ${msg.isSender ? 'bg-gradient-to-br from-blue-500 to-blue-600 rounded-t-2xl rounded-bl-2xl' : 'bg-neutral-800 rounded-t-2xl rounded-br-2xl'}`}>
                            <p className="break-words text-[15px]">{msg.content}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-2 bg-black/50 backdrop-blur-xl flex items-center gap-2 border-t border-neutral-800">
                <button className="p-2.5 text-slate-300 hover:text-white">
                    <Paperclip size={22} />
                </button>
                <input type="text" placeholder={`${t('messages_title')}...`} className="flex-grow bg-neutral-800 rounded-full py-2.5 px-4 text-white focus:outline-none" />
                <button className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors">
                    <Send size={22} />
                </button>
            </div>
        </div>
    );
    
    const Placeholder = () => (
        <div className="h-full flex flex-col items-center justify-center text-neutral-500 bg-black/20">
            <MessageCircle size={64} className="mb-4" />
            <h2 className="text-xl font-semibold">{t('select_a_conversation')}</h2>
            <p className="text-sm">{t('select_a_conversation_prompt')}</p>
        </div>
    );

    return (
        <div className="bg-transparent text-white h-full flex flex-row">
            <div className="w-96 flex-shrink-0 border-r border-neutral-800/50">
                <ConversationList />
            </div>
            <div className="flex-grow">
                {selectedConversation 
                    ? <ConversationView conversation={selectedConversation} isTwoPane={true} /> 
                    : <Placeholder />
                }
            </div>
        </div>
    );
};

export default MessagesApp;
