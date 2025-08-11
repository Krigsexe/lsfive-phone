
import React, { useState } from 'react';
import { ALL_APPS } from '../../constants';
import type { AppInfo } from '../../types';
import { useLocale } from '../../i18n';
import { LoaderCircle } from 'lucide-react';

interface MarketplaceAppProps {
    installedApps: AppInfo[];
    setInstalledApps: (apps: AppInfo[]) => void;
}

const MarketplaceApp: React.FC<MarketplaceAppProps> = ({ installedApps, setInstalledApps }) => {
    const { t } = useLocale();
    const [installingAppId, setInstallingAppId] = useState<string | null>(null);
    
    const isInstalled = (appId: string) => {
        return installedApps.some(app => app.id === appId);
    };

    const handleInstall = (appToInstall: AppInfo) => {
        if (installingAppId) return; // Prevent multiple installs at once

        setInstallingAppId(appToInstall.id);

        // Simulate installation time
        setTimeout(() => {
            setInstalledApps([...installedApps, appToInstall]);
            setInstallingAppId(null);
        }, 2500); // 2.5 second delay
    };

    const handleUninstall = (appToUninstall: AppInfo) => {
        if (!appToUninstall.isRemovable || installingAppId) return; // safety check and prevent uninstall during install
        setInstalledApps(installedApps.filter(app => app.id !== appToUninstall.id));
    };
    
    const renderIcon = (app: AppInfo) => {
        const IconComponent = app.icon;
        return <IconComponent className={app.color} size={28} />;
    };

    const availableApps = ALL_APPS;

    return (
        <div className="bg-transparent text-white h-full overflow-y-auto">
            <header className="p-4 pt-6 sticky top-0 bg-black/30 backdrop-blur-xl z-10">
                <h1 className="large-title text-white">{t('app_store_title')}</h1>
            </header>
            <div className="p-2">
                <ul className="space-y-2">
                    {availableApps.map(app => {
                        const isInstalling = installingAppId === app.id;
                        return (
                            <li key={app.id} className="p-2.5 flex items-center gap-4">
                                 <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden ${app.bgColor || 'bg-neutral-800'}`} style={{borderRadius: '22.5%'}}>
                                    {renderIcon(app)}
                                </div>
                                <div className="flex-grow border-b border-neutral-800 pb-3">
                                    <p className="font-bold text-base">{t(app.name)}</p>
                                    <p className="text-xs text-neutral-400">
                                        {app.isRemovable ? t('standard_app') : t('system_app')}
                                    </p>
                                </div>
                                {app.isRemovable ? (
                                    isInstalled(app.id) ? (
                                        <button 
                                            onClick={() => handleUninstall(app)} 
                                            className="bg-neutral-700 text-[var(--accent-red)] text-sm font-semibold px-4 py-1 rounded-full hover:bg-neutral-600 transition-colors disabled:opacity-50"
                                            disabled={!!installingAppId}
                                        >
                                            {t('uninstall')}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleInstall(app)} 
                                            className={`bg-neutral-700 text-[var(--accent-blue)] text-sm font-bold px-4 py-1 w-24 text-center rounded-full transition-colors ${isInstalling ? 'cursor-not-allowed' : 'hover:bg-neutral-600'} ${installingAppId && !isInstalling ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={!!installingAppId}
                                        >
                                            {isInstalling ? (
                                                <span className="flex items-center justify-center">
                                                    <LoaderCircle size={16} className="animate-spin" />
                                                </span>
                                            ) : (
                                                t('install')
                                            )}
                                        </button>
                                    )
                                ) : (
                                    <span className="text-neutral-500 text-sm font-medium pr-2">{t('installed')}</span>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    );
};

export default MarketplaceApp;