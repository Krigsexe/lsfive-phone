
import React, { useState } from 'react';
import { ChevronLeft, CloudUpload } from 'lucide-react';
import { useLocale } from '../../i18n';

interface BackupSettingsProps {
    onBack: () => void;
    onBackup: () => void;
}

const BackupSettings: React.FC<BackupSettingsProps> = ({ onBack, onBackup }) => {
    const { t } = useLocale();
    const [lastBackup, setLastBackup] = useState<Date | null>(null);
    const [isBackingUp, setIsBackingUp] = useState(false);

    const handleBackupClick = () => {
        setIsBackingUp(true);
        onBackup();
        // Simulate backup time and update UI
        setTimeout(() => {
            setLastBackup(new Date());
            setIsBackingUp(false);
        }, 2000);
    };

    return (
        <div>
            <header className="p-3 bg-[var(--bg-secondary)]/80 backdrop-blur-sm flex items-center gap-4 sticky top-0 border-b border-[var(--border-color)]">
                <button onClick={onBack} className="text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--bg-tertiary)]">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)]">{t('backup')}</h1>
            </header>
            <div className="p-4 space-y-4">
                <div className="text-center">
                    <CloudUpload size={80} className="mx-auto text-green-500" />
                    <p className="mt-4 text-[var(--text-secondary)]">{t('backup_desc')}</p>
                </div>

                <div className="bg-[var(--surface-raised)] rounded-xl p-4 text-center">
                    <button
                        onClick={handleBackupClick}
                        disabled={isBackingUp}
                        className="bg-green-500 text-white font-bold py-3 px-8 rounded-lg transition-colors hover:bg-green-600 disabled:bg-neutral-600 w-full"
                    >
                        {isBackingUp ? `${t('backup_now')}...` : t('backup_now')}
                    </button>
                    <p className="text-xs text-[var(--text-secondary)] mt-3">
                        {t('last_backup')}: {lastBackup ? lastBackup.toLocaleString() : t('never')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BackupSettings;