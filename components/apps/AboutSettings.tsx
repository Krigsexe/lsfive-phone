
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useLocale } from '../../i18n';

interface AboutSettingsProps {
    onBack: () => void;
    myPhoneNumber: string;
}

const AboutSettings: React.FC<AboutSettingsProps> = ({ onBack, myPhoneNumber }) => {
    const { t } = useLocale();
    return (
        <div className="h-full overflow-y-auto">
            <header className="p-2 bg-[var(--bg-secondary)]/80 backdrop-blur-xl flex items-center sticky top-0 border-b border-[var(--border-color)] z-10">
                <button onClick={onBack} className="text-[var(--accent-blue)] p-2 flex items-center">
                    <ChevronLeft size={28} className="-ml-2"/>
                    <span className="text-base -ml-1">{t('settings_title')}</span>
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)] absolute left-1/2 -translate-x-1/2">{t('general')}</h1>
            </header>
            <div className="p-3 space-y-4">
                <div className="bg-[var(--surface-raised)] rounded-lg">
                     <div className="flex justify-between items-center p-3">
                        <span className="font-medium text-[var(--text-primary)]">{t('my_number')}</span>
                        <span className="text-[var(--text-secondary)]">{myPhoneNumber}</span>
                    </div>
                </div>

                <div className="text-center text-xs text-[var(--text-secondary)] pt-8">
                    <p>Version 1.0.0</p>
                    <p>
                        By <a href="https://github.com/Krigsexe" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue)] hover:underline">Krigs</a>
                    </p>
                    <p>& Powered by Gemini AI studio</p>
                </div>
            </div>
        </div>
    );
};

export default AboutSettings;