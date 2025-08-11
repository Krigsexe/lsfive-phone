
import React from 'react';
import { ChevronLeft, Bell } from 'lucide-react';
import { useLocale } from '../../i18n';

interface NotificationsSettingsProps {
    onBack: () => void;
}

const NotificationsSettings: React.FC<NotificationsSettingsProps> = ({ onBack }) => {
    const { t } = useLocale();
    return (
        <div>
            <header className="p-3 bg-[var(--bg-secondary)]/80 backdrop-blur-sm flex items-center gap-4 sticky top-0 border-b border-[var(--border-color)]">
                <button onClick={onBack} className="text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--bg-tertiary)]">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)]">{t('notifications')}</h1>
            </header>
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] p-8 -mt-24">
                <Bell size={64} className="mb-4" />
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('notifications')}</h1>
                <p className="mt-2 text-center">{t('under_construction')}</p>
            </div>
        </div>
    );
};

export default NotificationsSettings;