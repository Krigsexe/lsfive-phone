
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useLocale } from '../../i18n';
import type { PhoneSettings } from '../../types';
import SettingsSwitch from './SettingsSwitch';
import { SunMoon } from 'lucide-react';

interface DisplaySettingsProps {
    onBack: () => void;
    settings: PhoneSettings;
    onUpdateSettings: (settings: Partial<PhoneSettings>) => void;
}

const DisplaySettings: React.FC<DisplaySettingsProps> = ({ onBack, settings, onUpdateSettings }) => {
    const { t } = useLocale();

    const isDarkMode = settings.theme === 'dark';
    
    const handleThemeChange = (isDark: boolean) => {
        onUpdateSettings({ theme: isDark ? 'dark' : 'light' });
    }

    return (
        <div>
            <header className="p-3 bg-[var(--bg-secondary)]/80 backdrop-blur-sm flex items-center gap-4 sticky top-0 border-b border-[var(--border-color)]">
                <button onClick={onBack} className="text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--bg-tertiary)]">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)]">{t('display_and_brightness')}</h1>
            </header>
            <div className="p-3">
                 <h2 className="text-xs uppercase text-[var(--text-secondary)] font-semibold px-4 py-2">{t('appearance')}</h2>
                 <div className="bg-[var(--surface-raised)] rounded-xl">
                    <SettingsSwitch 
                        icon={SunMoon} 
                        color="bg-slate-500" 
                        label={t('dark_mode')} 
                        checked={isDarkMode} 
                        onChange={handleThemeChange}
                    />
                 </div>
            </div>
        </div>
    );
};

export default DisplaySettings;