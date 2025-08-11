
import React from 'react';
import { useLocale } from '../../i18n';
import type { Wallpaper, PhoneSettings } from '../../types';
import { Plane, Bell, SunMoon, Image, Languages, Store, CloudUpload, Smartphone, Settings } from 'lucide-react';

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
    const [page, setPage] = React.useState<SettingsPage>('main');
    const { t } = useLocale();
    const { 
        myPhoneNumber, currentLanguage, onSetLanguage, setCurrentWallpaper, 
        onOpenMarketplace, wallpapers, setWallpapers, settings, onUpdateSettings, onBackup
    } = props;
    
    const SettingsPlaceholder = () => (
        <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)]">
            <Settings size={64} className="mb-4" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t('select_setting')}</h2>
            <p className="text-sm">{t('select_setting_prompt')}</p>
        </div>
    );

    const renderContent = () => {
        switch (page) {
            case 'about':
                return <AboutSettings onBack={() => setPage('main')} myPhoneNumber={myPhoneNumber} />;
            case 'wallpaper':
                return <WallpaperSettings 
                            onBack={() => setPage('main')} 
                            onSelectWallpaper={setCurrentWallpaper} 
                            wallpapers={wallpapers}
                            setWallpapers={setWallpapers}
                        />;
            case 'language':
                return <LanguageSettings onBack={() => setPage('main')} currentLanguage={currentLanguage} onSelectLanguage={onSetLanguage} />;
            case 'display':
                return <DisplaySettings onBack={() => setPage('main')} settings={settings} onUpdateSettings={onUpdateSettings} />;
            case 'notifications':
                return <NotificationsSettings onBack={() => setPage('main')} />;
            case 'backup':
                return <BackupSettings onBack={() => setPage('main')} onBackup={onBackup} />;
            case 'main':
            default:
                return <SettingsPlaceholder />;
        }
    };

    return (
         <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] h-full flex flex-row">
            <div className="w-96 flex-shrink-0 border-r border-[var(--border-color)] overflow-y-auto">
                 <header className="p-4 sticky top-0 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
                     <h1 className="text-3xl font-bold text-[var(--text-primary)]">{t('settings_title')}</h1>
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
            <div className="flex-grow overflow-y-auto">
                {renderContent()}
            </div>
         </div>
    );
};

export default SettingsApp;
