
import React, { useState } from 'react';
import { useLocale } from '../../i18n';
import type { Wallpaper, PhoneSettings } from '../../types';
import { Plane, Bell, SunMoon, Image, Languages, Store, CloudUpload, Smartphone } from 'lucide-react';

import AboutSettings from './AboutSettings';
import WallpaperSettings from './WallpaperSettings';
import LanguageSettings from './LanguageSettings';
import DisplaySettings from './DisplaySettings';
import NotificationsSettings from './NotificationsSettings';
import BackupSettings from './BackupSettings';
import SettingsItem from './SettingsItem';
import SettingsSwitch from './SettingsSwitch';

interface SettingsAppProps {
    myPhoneNumber: string;
    currentLanguage: 'en' | 'fr';
    onSetLanguage: (lang: 'en' | 'fr') => void;
    setCurrentWallpaper: (url: string) => void;
    onOpenMarketplace: () => void;
    wallpapers: Wallpaper[];
    setWallpapers: (wallpapers: Wallpaper[]) => void;
    settings: PhoneSettings;
    onUpdateSettings: (settings: Partial<PhoneSettings>) => void;
    onBackup: () => void;
}

type SettingsPage = 'main' | 'about' | 'wallpaper' | 'language' | 'display' | 'notifications' | 'backup';

const SettingsApp: React.FC<SettingsAppProps> = (props) => {
    const [page, setPage] = useState<SettingsPage>('main');
    const { t } = useLocale();
    const { 
        myPhoneNumber, currentLanguage, onSetLanguage, setCurrentWallpaper, 
        onOpenMarketplace, wallpapers, setWallpapers, settings, onUpdateSettings, onBackup
    } = props;

    const MainSettingsPage = () => (
         <div className="overflow-y-auto h-full">
             <header className="p-4 pt-6 sticky top-0 bg-[var(--bg-primary)]/80 backdrop-blur-xl">
                 <h1 className="large-title text-[var(--text-primary)]">{t('settings_title')}</h1>
            </header>
            <div className="p-3 space-y-4">
                <div className="bg-[var(--surface-raised)] rounded-xl">
                    <SettingsSwitch 
                        icon={Plane} 
                        color="bg-orange-400" 
                        label={t('airplane_mode')} 
                        checked={settings.airplaneMode}
                        onChange={(val) => onUpdateSettings({ airplaneMode: val })}
                    />
                </div>
                 <div className="bg-[var(--surface-raised)] rounded-xl">
                     <SettingsItem icon={Bell} color="bg-red-500" label={t('notifications')} onClick={() => setPage('notifications')} />
                     <SettingsItem icon={SunMoon} color="bg-slate-500" label={t('display_and_brightness')} onClick={() => setPage('display')} />
                     <SettingsItem icon={Image} color="bg-blue-500" label={t('wallpaper')} onClick={() => setPage('wallpaper')} />
                     <SettingsItem icon={Languages} color="bg-indigo-500" label={t('language')} onClick={() => setPage('language')} />
                     <SettingsItem icon={Smartphone} color="bg-gray-500" label={t('general')} onClick={() => setPage('about')} hasDivider={false} />
                 </div>
                 <div className="bg-[var(--surface-raised)] rounded-xl">
                     <SettingsItem icon={Store} color="bg-sky-500" label={t('app_store_title')} onClick={onOpenMarketplace} hasDivider={false} />
                 </div>
                 <div className="bg-[var(--surface-raised)] rounded-xl">
                     <SettingsItem icon={CloudUpload} color="bg-green-500" label={t('backup')} onClick={() => setPage('backup')} hasDivider={false} />
                 </div>
            </div>
        </div>
    );

    const pages: { [key in SettingsPage]: JSX.Element } = {
        main: <MainSettingsPage />,
        about: <AboutSettings onBack={() => setPage('main')} myPhoneNumber={myPhoneNumber} />,
        wallpaper: <WallpaperSettings 
                        onBack={() => setPage('main')} 
                        onSelectWallpaper={setCurrentWallpaper} 
                        wallpapers={wallpapers}
                        setWallpapers={setWallpapers}
                    />,
        language: <LanguageSettings onBack={() => setPage('main')} currentLanguage={currentLanguage} onSelectLanguage={onSetLanguage} />,
        display: <DisplaySettings onBack={() => setPage('main')} settings={settings} onUpdateSettings={onUpdateSettings} />,
        notifications: <NotificationsSettings onBack={() => setPage('main')} />,
        backup: <BackupSettings onBack={() => setPage('main')} onBackup={onBackup} />,
    };

    return (
        <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] h-full overflow-hidden relative">
            <div 
                className="w-full h-full transition-transform duration-300 ease-in-out"
                style={{ transform: page !== 'main' ? 'translateX(-100%)' : 'translateX(0)' }}
            >
                {pages.main}
            </div>
            <div 
                className="w-full h-full absolute top-0 left-0 transition-transform duration-300 ease-in-out"
                style={{ transform: page !== 'main' ? 'translateX(0)' : 'translateX(100%)' }}
            >
                {page !== 'main' && pages[page]}
            </div>
        </div>
    );
};

export default SettingsApp;