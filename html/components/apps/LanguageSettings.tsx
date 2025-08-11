
import React from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { useLocale } from '../../i18n';

interface LanguageSettingsProps {
    onBack: () => void;
    currentLanguage: 'en' | 'fr';
    onSelectLanguage: (lang: 'en' | 'fr') => void;
}

const LANGUAGES = [
    { id: 'en', name: 'English' },
    { id: 'fr', name: 'Français' },
];

const LanguageSettings: React.FC<LanguageSettingsProps> = ({ onBack, currentLanguage, onSelectLanguage }) => {
    const { t } = useLocale();
    
    return (
        <div>
            <header className="p-3 bg-neutral-900/80 backdrop-blur-sm flex items-center gap-4 sticky top-0 border-b border-neutral-800 z-10">
                <button onClick={onBack} className="text-white p-1 rounded-full hover:bg-neutral-700">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-white">{t('language')}</h1>
            </header>
            <div className="p-2 mt-2">
                <div className="bg-neutral-800/50 rounded-lg">
                    {LANGUAGES.map((lang, index) => (
                         <div 
                            key={lang.id} 
                            onClick={() => onSelectLanguage(lang.id as 'en' | 'fr')}
                            className={`flex justify-between items-center p-3 cursor-pointer hover:bg-neutral-700/60 ${index < LANGUAGES.length -1 ? 'border-b border-neutral-700/80' : ''}`}
                         >
                            <span className="font-medium">{lang.name}</span>
                            {currentLanguage === lang.id && <Check size={20} className="text-blue-500"/>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LanguageSettings;
