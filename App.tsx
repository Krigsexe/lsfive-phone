
import React, { useState, useEffect, useMemo } from 'react';
import { AppType, type Contact, type AppInfo, type CallRecord, type Conversation, type Song, type Wallpaper, type Vehicle, type BankAccount, type Business, type Mail as MailType, DispatchAlert, SocialPost, PhoneSettings, CallDirection, MusicState, Notification, WidgetType } from './types';
import PhoneShell from './components/PhoneShell';
import HomeScreen from './components/HomeScreen';
import MessagesApp from './components/apps/MessagesApp';
import PhoneApp from './components/apps/PhoneApp';
import SettingsApp from './components/apps/SettingsApp';
import MarketplaceApp from './components/apps/MarketplaceApp';
import InCallUI from './components/InCallUI';
import IncomingCall from './components/IncomingCall';
import { ALL_APPS, DEFAULT_WALLPAPERS, MY_PHONE_NUMBER, DEFAULT_DOCK_APP_IDS } from './constants';
import { useLocale } from './i18n';
import BrowserApp from './components/apps/BrowserApp';
import CameraApp from './components/apps/CameraApp';
import PlaceholderApp from './components/apps/PlaceholderApp';
import MusicApp from './components/apps/MusicApp';
import BootScreen from './components/BootScreen';
import GarageApp from './components/apps/GarageApp';
import BankApp from './components/apps/BankApp';
import BusinessApp from './components/apps/BusinessApp';
import DispatchApp from './components/apps/DispatchApp';
import WeatherApp from './components/apps/WeatherApp';
import MailApp from './components/apps/MailApp';
import SocialApp from './components/apps/SocialApp';
import { MessageCircle, PhoneMissed } from 'lucide-react';

const getInitialApps = (): AppInfo[] => {
    const defaultApps = ALL_APPS.filter(app => !app.isRemovable || [AppType.MUSIC, AppType.GARAGE, AppType.BANK, AppType.BUSINESSES, AppType.DISPATCH].includes(app.id));
    try {
        const storedOrder = localStorage.getItem('phone_app_order');
        if (storedOrder) {
            const appIds = JSON.parse(storedOrder) as AppType[];
            
            const installedAppsMap = new Map(defaultApps.map(app => [app.id, app]));
            const orderedApps = appIds
                .map(id => installedAppsMap.get(id))
                .filter((app): app is AppInfo => !!app);
            
            const presentAppIds = new Set(orderedApps.map(app => app.id));
            const missingApps = defaultApps.filter(app => !presentAppIds.has(app.id));

            return [...orderedApps, ...missingApps];
        }
    } catch (e) {
        console.error("Failed to parse app order from localStorage", e);
    }
    return defaultApps;
};

const getInitialDock = (): AppType[] => {
    try {
        const storedDock = localStorage.getItem('phone_dock_order');
        if (storedDock) {
            return JSON.parse(storedDock) as AppType[];
        }
    } catch (e) {
        console.error("Failed to parse dock order from localStorage", e);
    }
    return DEFAULT_DOCK_APP_IDS;
};

const getInitialSettings = (): PhoneSettings => {
    try {
        const storedSettings = localStorage.getItem('phone_settings');
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            return {
                theme: parsed.theme || 'dark',
                airplaneMode: parsed.airplaneMode || false
            };
        }
    } catch (e) {
        console.error("Failed to parse settings from localStorage", e);
    }
    return { theme: 'dark', airplaneMode: false };
};

const getYouTubeId = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }
        if (urlObj.hostname.includes('youtube.com')) {
            return urlObj.searchParams.get('v');
        }
    } catch (e) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
    return null;
};


const App: React.FC = () => {
    const [isBooting, setIsBooting] = useState(true);
    const [isVisible, setIsVisible] = useState(true);
    const [activeApp, setActiveApp] = useState<AppType | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Call states
    const [callState, setCallState] = useState<'idle' | 'incoming' | 'active'>('idle');
    const [activeCallContact, setActiveCallContact] = useState<Contact | null>(null);

    // Settings
    const [settings, setSettings] = useState<PhoneSettings>(getInitialSettings());

    // Data states
    const [installedApps, setInstalledApps] = useState<AppInfo[]>(getInitialApps());
    const [dockAppIds, setDockAppIds] = useState<AppType[]>(getInitialDock());
    const [wallpapers, setWallpapers] = useState<Wallpaper[]>(DEFAULT_WALLPAPERS);
    const [currentWallpaperUrl, setCurrentWallpaperUrl] = useState<string>(DEFAULT_WALLPAPERS[0].url);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
    const [songs, setSongs] = useState<Song[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [mails, setMails] = useState<MailType[]>([]);
    const [alerts, setAlerts] = useState<DispatchAlert[]>([]);
    const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
    const [widgets, setWidgets] = useState<WidgetType[]>([WidgetType.CLOCK, WidgetType.MUSIC]);
    
    // Global state for shared components (Widgets, QuickPanel)
    const [musicState, setMusicState] = useState<MusicState>({
        currentSong: null,
        isPlaying: false,
        progress: 0,
        duration: 0,
    });
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const { locale, setLocale } = useLocale();
    
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme);
        try {
            localStorage.setItem('phone_settings', JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save settings to localStorage", e);
        }
    }, [settings]);
    
    useEffect(() => {
        const timer = setTimeout(() => setIsBooting(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    // Effect to aggregate notifications for the QuickPanel
    useEffect(() => {
        const unreadMessages = conversations
            .filter(c => c.unread > 0)
            .map(c => ({
                id: `msg-${c.phoneNumber}`,
                appId: AppType.MESSAGES,
                title: c.contactName,
                message: `${c.unread} new message${c.unread > 1 ? 's' : ''}`,
                icon: MessageCircle,
                timestamp: Date.now() + Math.random(),
            }));
            
        const missedCalls = callHistory
            .filter(c => c.isNew && c.direction === CallDirection.MISSED)
            .map(c => ({
                id: `call-${c.id}`,
                appId: AppType.PHONE,
                title: c.contact.name,
                message: 'Missed call',
                icon: PhoneMissed,
                timestamp: Date.now() + Math.random(),
            }));
            
        const sortedNotifications = [...missedCalls, ...unreadMessages].sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(sortedNotifications);
    }, [conversations, callHistory]);

    const openApp = (app: AppType) => {
        if (isEditMode) return;
        setActiveApp(app);
    }
    const goHome = () => {
        if (isEditMode) {
            setIsEditMode(false);
        } else {
            setActiveApp(null);
        }
    };

    const handleAcceptCall = () => {
        setCallState('active');
        setActiveApp(AppType.PHONE);
    };

    const handleDeclineCall = () => {
        setCallState('idle');
        setActiveCallContact(null);
    };

    const handleEndCall = () => {
        setCallState('idle');
        setActiveCallContact(null);
        goHome();
    };
    
    const handlePlaceCall = (contact: Contact) => {
        setActiveCallContact(contact);
        setCallState('active');
        setActiveApp(AppType.PHONE);
    };
    
    const handleSetLanguage = (lang: 'en' | 'fr') => {
        setLocale(lang);
    };
    
    const handleSetApps = (newApps: AppInfo[]) => {
        setInstalledApps(newApps);
        try {
            const appIds = newApps.map(app => app.id);
            localStorage.setItem('phone_app_order', JSON.stringify(appIds));
        } catch (e) {
            console.error("Failed to save app order to localStorage", e);
        }
    };

    const handleRemoveApp = (appId: AppType) => {
        const appToRemove = installedApps.find(app => app.id === appId);
        if (!appToRemove || !appToRemove.isRemovable) return;

        handleSetApps(installedApps.filter(app => app.id !== appId));
        handleSetDockAppIds(dockAppIds.filter(id => id !== appId));
    };

    const handleSetDockAppIds = (newDockIds: AppType[]) => {
        setDockAppIds(newDockIds);
        try {
            localStorage.setItem('phone_dock_order', JSON.stringify(newDockIds));
        } catch (e) {
            console.error("Failed to save dock order to localStorage", e);
        }
    };

    // Action Handlers to be passed to apps
    const handleBankTransfer = (data: { recipient: string, amount: string, reason: string }) => console.log('[ACTION] Bank Transfer:', data);
    const handleRequestVehicle = (vehicleId: string) => console.log('[ACTION] Request Vehicle:', vehicleId);
    const handleSetBusinessGPS = (location: Business['location']) => console.log('[ACTION] Set Business GPS:', location);
    const handleCreateAlert = (data: { title: string, details: string, location: string }) => console.log('[ACTION] Create Dispatch Alert:', data);
    const handleSendMail = (data: { to: string, subject: string, body: string }) => console.log('[ACTION] Send Mail:', data);
    const handleDeleteMail = (mailId: string) => console.log('[ACTION] Delete Mail:', mailId);
    const handleCreatePost = (data: { imageUrl: string, caption: string }) => {
        console.log('[ACTION] Create Social Post:', data);
        const newPost: SocialPost = { id: `post-${Date.now()}`, authorName: 'You', authorAvatarUrl: `https://ui-avatars.com/api/?name=You&background=random`, imageUrl: data.imageUrl, caption: data.caption, likes: 0, isLiked: false, timestamp: '1m' };
        setSocialPosts([newPost, ...socialPosts]);
    }
    const handleLikePost = (postId: string) => {
        console.log('[ACTION] Like Social Post:', postId);
        setSocialPosts(socialPosts.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
    }

    const handleUpdateSettings = (updates: Partial<PhoneSettings>) => setSettings(prev => ({ ...prev, ...updates }));
    const handleBackup = () => { console.log('[ACTION] Backup initiated.'); alert('Phone data backup initiated!'); }
    const handleClearMissedCalls = () => setCallHistory(prev => prev.map(call => call.direction === CallDirection.MISSED ? { ...call, isNew: false } : call));
    const handleClearUnreadMessages = (phoneNumber: string) => setConversations(prev => prev.map(convo => convo.phoneNumber === phoneNumber ? { ...convo, unread: 0 } : convo));
    const handleClearNotifications = () => {
        handleClearMissedCalls();
        conversations.filter(c => c.unread > 0).forEach(c => handleClearUnreadMessages(c.phoneNumber));
    };

    // Music State Handlers
    const handleSelectSong = (song: Song) => {
        const videoId = getYouTubeId(song.url);
        setMusicState({
            currentSong: { ...song, artwork: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : undefined },
            isPlaying: true,
            progress: 0,
            duration: 0,
        });
    };
    const handleTogglePlay = () => {
        if (musicState.currentSong) {
            setMusicState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
        }
    };
    const handleUpdateMusicState = (updates: Partial<MusicState>) => {
        setMusicState(prev => ({ ...prev, ...updates }));
    };

    const appsWithNotifications = useMemo(() => {
        const unreadMessagesCount = conversations.reduce((sum, convo) => sum + convo.unread, 0);
        const missedCallsCount = callHistory.filter(call => call.isNew && call.direction === CallDirection.MISSED).length;

        return installedApps.map(app => {
            if (app.id === AppType.MESSAGES) return { ...app, notificationCount: unreadMessagesCount };
            if (app.id === AppType.PHONE) return { ...app, notificationCount: missedCallsCount };
            return app;
        });
    }, [installedApps, conversations, callHistory]);

    const renderAppContent = () => {
        if (callState === 'active' && activeApp === AppType.PHONE && activeCallContact) {
            return <InCallUI contact={activeCallContact} onEndCall={handleEndCall} />;
        }

        switch (activeApp) {
            case AppType.PHONE: return <PhoneApp onPlaceCall={handlePlaceCall} contacts={contacts} recentCalls={callHistory} onViewRecents={handleClearMissedCalls} />;
            case AppType.MESSAGES: return <MessagesApp conversations={conversations} myNumber={MY_PHONE_NUMBER} onViewConversation={handleClearUnreadMessages} />;
            case AppType.SETTINGS:
                return <SettingsApp myPhoneNumber={MY_PHONE_NUMBER} currentLanguage={locale as 'en' | 'fr'} onSetLanguage={handleSetLanguage} setCurrentWallpaper={setCurrentWallpaperUrl} wallpapers={wallpapers} setWallpapers={setWallpapers} onOpenMarketplace={() => openApp(AppType.MARKETPLACE)} settings={settings} onUpdateSettings={handleUpdateSettings} onBackup={handleBackup} />;
            case AppType.MARKETPLACE: return <MarketplaceApp installedApps={installedApps} setInstalledApps={handleSetApps} />;
            case AppType.BROWSER: return <BrowserApp />;
            case AppType.CAMERA: return <CameraApp />;
            case AppType.MUSIC: return <MusicApp songs={songs} setSongs={setSongs} musicState={musicState} onSelectSong={handleSelectSong} onTogglePlay={handleTogglePlay} onUpdateState={handleUpdateMusicState} />;
            case AppType.GARAGE: return <GarageApp vehicles={vehicles} onRequestVehicle={handleRequestVehicle} />;
            case AppType.BANK: return <BankApp account={bankAccount} onTransfer={handleBankTransfer} />;
            case AppType.BUSINESSES: return <BusinessApp businesses={businesses} onSetGPS={handleSetBusinessGPS} />;
            case AppType.DISPATCH: return <DispatchApp alerts={alerts} onCreateAlert={handleCreateAlert} />;
            case AppType.WEATHER: return <WeatherApp locale={locale as 'en' | 'fr'} />;
            case AppType.MAIL: return <MailApp mails={mails} myEmailAddress="you@ls.mail" onSend={handleSendMail} onDelete={handleDeleteMail} />;
            case AppType.SOCIAL: return <SocialApp posts={socialPosts} onCreatePost={handleCreatePost} onLikePost={handleLikePost} />;
            
            case AppType.PHOTOS:
            case AppType.CLOCK:
            case AppType.NOTES:
            case AppType.REMINDERS:
            case AppType.STOCKS:
            case AppType.HEALTH:
            case AppType.WALLET:
                return <PlaceholderApp appNameKey={activeApp + '_title'} />;
            default:
                return <HomeScreen 
                    apps={appsWithNotifications} 
                    setApps={handleSetApps} 
                    dockAppIds={dockAppIds}
                    setDockAppIds={handleSetDockAppIds}
                    onOpenApp={openApp}
                    musicState={musicState}
                    onTogglePlay={handleTogglePlay}
                    onSelectSong={handleSelectSong}
                    locale={locale as 'en' | 'fr'}
                    isEditMode={isEditMode}
                    setIsEditMode={setIsEditMode}
                    onRemoveApp={handleRemoveApp}
                    widgets={widgets}
                    setWidgets={setWidgets}
                />;
        }
    };

    if (!isVisible) return null;

    if (isBooting) {
        return <BootScreen />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <PhoneShell 
                onHomeClick={goHome} 
                callState={callState} 
                activeCallContact={activeCallContact}
                locale={locale as 'en' | 'fr'}
                wallpaperUrl={currentWallpaperUrl}
                notifications={notifications}
                onClearNotifications={handleClearNotifications}
                musicState={musicState}
                onTogglePlay={handleTogglePlay}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
            >
                {callState === 'incoming' && activeCallContact ? (
                    <IncomingCall contact={activeCallContact} onAccept={handleAcceptCall} onDecline={handleDeclineCall} />
                ) : (
                    renderAppContent()
                )}
            </PhoneShell>
        </div>
    );
};

export default App;