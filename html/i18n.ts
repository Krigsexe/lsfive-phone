
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Translations = { [key: string]: string };
type LocaleContextType = {
    locale: string;
    setLocale: (locale: string) => void;
    t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode; initialLocale?: string }> = ({ children, initialLocale = 'en' }) => {
    const [locale, setLocale] = useState(initialLocale);
    const [translations, setTranslations] = useState<Translations>({});

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const response = await fetch(`/locales/${locale}.json`);
                if (!response.ok) {
                    throw new Error(`Could not load ${locale}.json`);
                }
                const data = await response.json();
                setTranslations(data);
            } catch (error) {
                console.error('Failed to fetch translations:', error);
                // Fallback to English if the selected locale fails
                if (locale !== 'en') {
                    setLocale('en');
                }
            }
        };

        fetchTranslations();
    }, [locale]);
    
    useEffect(() => {
        setLocale(initialLocale);
    }, [initialLocale]);

    const t = (key: string): string => {
        return translations[key] || key;
    };

    return React.createElement(LocaleContext.Provider, { value: { locale, setLocale, t } }, children);
};

export const useLocale = (): LocaleContextType => {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
};
