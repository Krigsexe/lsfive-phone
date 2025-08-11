
import React from 'react';
import { Package } from 'lucide-react';
import { useLocale } from '../../i18n';

interface PlaceholderAppProps {
    appNameKey: string;
}

const PlaceholderApp: React.FC<PlaceholderAppProps> = ({ appNameKey }) => {
    const { t } = useLocale();
    return (
        <div className="h-full bg-transparent flex flex-col items-center justify-center text-white p-8">
            <Package size={64} className="text-neutral-500 mb-4" />
            <h1 className="text-3xl font-bold">{t(appNameKey)}</h1>
            <p className="text-slate-400 mt-2 text-center">{t('under_construction')}</p>
        </div>
    );
};

export default PlaceholderApp;