
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
        <div>
            <header className="p-3 bg-[var(--bg-secondary)]/80 backdrop-blur-sm flex items-center gap-4 sticky top-0 border-b border-[var(--border-color)] z-10">
                <button onClick={onBack} className="text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--bg-tertiary)]">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)]">{t('general')}</h1>
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