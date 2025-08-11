
import React, { useState } from 'react';
import type { BankAccount, Transaction } from '../../types';
import { ArrowUpRight, ArrowDownLeft, X, Send } from 'lucide-react';
import { useLocale } from '../../i18n';

interface BankAppProps {
    account: BankAccount | null;
    onTransfer: (data: { recipient: string, amount: string, reason: string }) => void;
}

const BankApp: React.FC<BankAppProps> = ({ account, onTransfer }) => {
    const { t, locale } = useLocale();
    const [isTransferModalOpen, setTransferModalOpen] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
            style: 'currency',
            currency: 'USD', // This can be changed based on server settings
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const TransferModal = () => {
        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
                recipient: formData.get('recipient') as string,
                amount: formData.get('amount') as string,
                reason: formData.get('reason') as string
            };
            onTransfer(data);
            setTransferModalOpen(false);
        };

        return (
             <div className="absolute inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4">
                <div className="bg-neutral-800 rounded-2xl p-6 w-full max-w-sm relative">
                    <button onClick={() => setTransferModalOpen(false)} className="absolute top-2 right-2 p-2 text-neutral-400 hover:text-white"><X size={24}/></button>
                    <h2 className="text-xl font-bold text-white mb-4">{t('new_transfer')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input name="recipient" type="text" placeholder={t('recipient_iban')} className="w-full bg-neutral-700 p-3 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
                        <input name="amount" type="number" step="0.01" placeholder={t('amount')} className="w-full bg-neutral-700 p-3 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
                        <input name="reason" type="text" placeholder={t('reason')} className="w-full bg-neutral-700 p-3 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                            <Send size={18}/> {t('send_transfer')}
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
        <li className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${transaction.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {transaction.type === 'credit' ? <ArrowDownLeft size={18} className="text-green-400" /> : <ArrowUpRight size={18} className="text-red-400" />}
                </div>
                <div>
                    <p className="font-semibold text-white">{transaction.description}</p>
                    <p className="text-sm text-neutral-400">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
            </div>
            <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                {transaction.type === 'credit' ? '+' : ''}{formatCurrency(transaction.amount)}
            </p>
        </li>
    );

    return (
        <div className="bg-transparent text-white h-full flex flex-col">
            <header className="p-4 text-center">
                <p className="text-sm text-emerald-200">{t('account_balance')}</p>
                <p className="text-5xl font-bold tracking-tight text-white mt-1">{formatCurrency(account?.balance ?? 0)}</p>
            </header>
            <div className="px-4 py-2">
                 <button onClick={() => setTransferModalOpen(true)} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                    {t('transfer')}
                </button>
            </div>
            <div className="flex-grow overflow-y-auto px-2 mt-4">
                 <h2 className="font-bold text-white px-3 pb-2 text-lg">{t('recent_transactions')}</h2>
                 {account && account.transactions.length > 0 ? (
                    <ul className="space-y-1 bg-black/20 rounded-xl">
                        {account.transactions.map(tx => <TransactionItem key={tx.id} transaction={tx} />)}
                    </ul>
                 ) : (
                    <p className="text-center text-neutral-500 p-8">{t('no_transactions')}</p>
                 )}
            </div>
            {isTransferModalOpen && <TransferModal />}
        </div>
    );
};

export default BankApp;
