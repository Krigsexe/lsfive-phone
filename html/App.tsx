
import React, { useState, useEffect, useMemo } from 'react';
import { AppType, type Contact, type AppInfo, type CallRecord, type Conversation, type UserData, type Song, type Wallpaper, type Vehicle, type BankAccount, type Business, type Mail as MailType, DispatchAlert, SocialPost, PhoneSettings, CallDirection, MdtCitizen, MdtIncident, MedicalRecord, MechanicInvoice, OnDutyUnit } from './types';
import PhoneShell from './components/PhoneShell';
import HomeScreen from './components/HomeScreen';
import MessagesApp from './components/apps/MessagesApp';
import PhoneApp from './components/apps/PhoneApp';
import SettingsApp from './components/apps/SettingsApp';
import MarketplaceApp from './components/apps/MarketplaceApp';
import InCallUI from './components/InCallUI';
import IncomingCall from './components/IncomingCall';
import { ALL_APPS, DEFAULT_WALLPAPERS, DEFAULT_DOCK_APP_IDS } from '../constants';
import { fetchNui } from './nui';
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
import MdtApp from './components/apps/MdtApp';
import MediTab from './components/apps/MediTab';
import MechaTab from './components/apps/MechaTab';


const DEFAULT_SETTINGS: PhoneSettings = {
    theme: 'dark',
    airplaneMode: false,
};

const App: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isBooting, setIsBooting] = useState(true);
    const [activeApp, setActiveApp] = useState<AppType | null>(null);
    
    // Data states, populated from NUI
    const [userData, setUserData] = useState<UserData | null>(null);
    const [installedApps, setInstalledApps] = useState<AppInfo[]>([]);
    const [dockAppIds, setDockAppIds] = useState<AppType[]>([]);
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
    const [settings, setSettings] = useState<PhoneSettings>(DEFAULT_SETTINGS);
    const [onDuty, setOnDuty] = useState(false);

    // Job-specific data
    const [mdtCitizens, setMdtCitizens] = useState<MdtCitizen[]>([]);
    const [mdtIncidents, setMdtIncidents] = useState<MdtIncident[]>([]);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [mechanicInvoices, setMechanicInvoices] = useState<MechanicInvoice[]>([]);
    const [onDutyUnits, setOnDutyUnits] = useState<OnDutyUnit[]>([]);

    // Call states
    const [callState, setCallState] = useState<'idle' | 'incoming' | 'active'>('idle');
    const [activeCallContact, setActiveCallContact] = useState<Contact | null>(null);

    const { locale, setLocale } = useLocale();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme);
    }, [settings.theme]);

    useEffect(() => {
        const handleNuiMessage = (event: MessageEvent) => {
            const { type, payload } = event.data;
            switch (type) {
                case 'setVisible':
                    if (payload && isVisible === false) { // Phone is being opened
                        setIsBooting(true);
                        setTimeout(() => setIsBooting(false), 2500);
                        fetchNui('phone:server:requestData');
                    }
                    setIsVisible(payload);
                    if (!payload) goHome(); // Go home when phone is closed
                    break;
                case 'loadData':
                    const { userData: loadedUserData, contacts: loadedContacts, calls: loadedCalls, messages: loadedMessages, vehicles, bank, businesses, mails, songs: loadedSongs, alerts: loadedAlerts, social_posts, mdt_incidents, medical_records, mechanic_invoices } = payload;
                    
                    setUserData(loadedUserData);
                    setOnDuty(loadedUserData.onduty || false);
                    setCurrentWallpaperUrl(loadedUserData.wallpaper || DEFAULT_WALLPAPERS[0].url);
                    setLocale(loadedUserData.language || 'fr');

                    try {
                        if (loadedUserData.settings) {
                            const parsedSettings = JSON.parse(loadedUserData.settings);
                            setSettings(parsedSettings);
                        } else {
                            setSettings(DEFAULT_SETTINGS);
                        }
                    } catch (e) {
                        console.error("Failed to parse settings, falling back to default.", e);
                        setSettings(DEFAULT_SETTINGS);
                    }

                    try {
                        if (loadedUserData.installed_apps) {
                            const installedIds = JSON.parse(loadedUserData.installed_apps);
                            const allAvailableApps = ALL_APPS.filter(app => !app.requiredJobs || app.requiredJobs.includes(loadedUserData.job));
                            const appsMap = new Map(allAvailableApps.map(app => [app.id, app]));
                            
                            const orderedApps = installedIds
                                .map((id: AppType) => appsMap.get(id))
                                .filter((app: AppInfo | undefined): app is AppInfo => !!app);
                            
                            const presentAppIds = new Set(orderedApps.map(app => app.id));
                            const missingApps = allAvailableApps.filter(app => !presentAppIds.has(app.id) && !app.isRemovable);

                            setInstalledApps([...orderedApps, ...missingApps]);
                        } else {
                            const defaultApps = ALL_APPS.filter(app => !app.isRemovable && (!app.requiredJobs || app.requiredJobs.includes(loadedUserData.job)));
                            setInstalledApps(defaultApps);
                        }
                    } catch (e) {
                        console.error("Failed to parse installed_apps", e);
                        const defaultApps = ALL_APPS.filter(app => !app.isRemovable && (!app.requiredJobs || app.requiredJobs.includes(loadedUserData.job)));
                        setInstalledApps(defaultApps);
                    }
                    
                    try {
                        if (loadedUserData.dock_order) {
                            const storedDock = JSON.parse(loadedUserData.dock_order);
                            setDockAppIds(storedDock);
                        } else {
                             setDockAppIds(DEFAULT_DOCK_APP_IDS);
                        }
                    } catch(e) {
                        console.error("Failed to parse dock_order, falling back to default.", e);
                        setDockAppIds(DEFAULT_DOCK_APP_IDS);
                    }
                    
                    setContacts(loadedContacts || []);
                    setCallHistory(loadedCalls || []);
                    setConversations(loadedMessages || []);
                    setVehicles(vehicles || []);
                    setBankAccount(bank || null);
                    setBusinesses(businesses || []);
                    setMails(mails || []);
                    setSongs(loadedSongs || []);
                    setAlerts(loadedAlerts || []);
                    setSocialPosts(social_posts || []);
                    setMdtIncidents(mdt_incidents || []);
                    setMedicalRecords(medical_records || []);
                    setMechanicInvoices(mechanic_invoices || []);
                    break;
                case 'incomingCall':
                    setActiveCallContact(payload.contact);
                    setCallState('incoming');
                    setIsVisible(true);
                    break;
                case 'updateUnits':
                    setOnDutyUnits(payload.units || []);
                    break;
            }
        };

        window.addEventListener('message', handleNuiMessage);
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                fetchNui('close');
            }
        };
        window.addEventListener('keydown', handleKeyDown);


        return () => {
            window.removeEventListener('message', handleNuiMessage);
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isVisible, setLocale]);

    const openApp = (app: AppType) => setActiveApp(app);
    const goHome = () => setActiveApp(null);

    // Call Actions
    const handleAcceptCall = () => { setCallState('active'); fetchNui('call:accept'); };
    const handleDeclineCall = () => { setCallState('idle'); setActiveCallContact(null); fetchNui('call:decline'); };
    const handleEndCall = () => { setCallState('idle'); setActiveCallContact(null); fetchNui('call:end'); goHome(); };
    const handlePlaceCall = (contact: Contact) => { setActiveCallContact(contact); setCallState('active'); setActiveApp(AppType.PHONE); fetchNui('call:start', { phoneNumber: contact.phoneNumber }); };

    // Settings Actions
    const handleUpdateSettings = (newSettings: Partial<PhoneSettings>) => {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        fetchNui('phone:updateSettings', { settings: JSON.stringify(updatedSettings) });
    };
    const handleSetWallpaper = (url: string) => { setCurrentWallpaperUrl(url); fetchNui('updateWallpaper', { wallpaperUrl: url }); }
    const handleSetLanguage = (lang: 'en' | 'fr') => { setLocale(lang); fetchNui('updateLanguage', { lang }); }
    const handleSetApps = (newApps: AppInfo[]) => { setInstalledApps(newApps); const appIds = newApps.map(app => app.id); fetchNui('updateInstalledApps', { apps: JSON.stringify(appIds) }); }
    const handleSetDockAppIds = (newDockIds: AppType[]) => { setDockAppIds(newDockIds); fetchNui('updateDockOrder', { dock_order: JSON.stringify(newDockIds) }); };
    const handleBackup = () => fetchNui('phone:backupData');

    // App-specific Actions
    const handleBankTransfer = (data: { recipient: string, amount: string, reason: string }) => fetchNui('bank:transfer', data);
    const handleRequestVehicle = (vehicleId: string) => fetchNui('garage:requestVehicle', { vehicleId });
    const handleSetBusinessGPS = (location: Business['location']) => fetchNui('business:setWaypoint', { location });
    const handleCreateAlert = (data: { title: string, details: string, location: string }) => fetchNui('dispatch:createAlert', data);
    const handleSendMail = (data: { to: string, subject: string, body: string }) => fetchNui('mail:send', data);
    const handleDeleteMail = (mailId: string) => fetchNui('mail:delete', { mailId });
    const handleSetSongs = (newSongs: Song[]) => { setSongs(newSongs); fetchNui('updateSongs', { songs: newSongs }); }
    const handleCreatePost = (data: { imageUrl: string, caption: string }) => fetchNui('social:createPost', data);
    const handleLikePost = (postId: string) => {
        setSocialPosts(socialPosts.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
        fetchNui('social:likePost', { postId });
    }
    const handleSetDuty = (status: boolean) => { setOnDuty(status); fetchNui('phone:setDuty', { status }); }

    // Job-specific action handlers
    const handleSearchCitizens = async (query: string): Promise<MdtCitizen[]> => (await fetchNui<MdtCitizen[]>('mdt:searchCitizens', { query })) || [];
    const handleCreateIncident = (data: any) => fetchNui('mdt:createIncident', data);
    const handleSearchMedicalRecords = async (query: string): Promise<MedicalRecord[]> => (await fetchNui<MedicalRecord[]>('meditab:searchRecords', { query })) || [];
    const handleCreateMedicalRecord = (data: any) => fetchNui('meditab:createRecord', data);
    const handleSearchVehicleInfo = async (plate: string): Promise<any> => (await fetchNui('mechatab:searchVehicle', { plate })) || null;
    const handleCreateInvoice = (data: any) => fetchNui('mechatab:createInvoice', data);


    // Notification Handlers
    const handleClearMissedCalls = () => {
        if (callHistory.some(c => c.isNew && c.direction === CallDirection.MISSED)) {
            setCallHistory(prev => prev.map(call => ({ ...call, isNew: false })));
            fetchNui('phone:clearMissedCalls');
        }
    };
    const handleClearUnreadMessages = (phoneNumber: string) => {
        setConversations(prev => prev.map(convo => convo.phoneNumber === phoneNumber ? { ...convo, unread: 0 } : convo));
        fetchNui('phone:clearUnreadMessages', { phoneNumber });
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
            case AppType.MESSAGES: return <MessagesApp conversations={conversations} myNumber={userData?.phone_number || ""} onViewConversation={handleClearUnreadMessages} />;
            case AppType.SETTINGS:
                return <SettingsApp myPhoneNumber={userData?.phone_number || "N/A"} currentLanguage={locale as 'en' | 'fr'} onSetLanguage={handleSetLanguage} setCurrentWallpaper={handleSetWallpaper} wallpapers={wallpapers} setWallpapers={(newWallpapers) => { setWallpapers(newWallpapers); fetchNui('updateWallpapers', { wallpapers: newWallpapers }); }} onOpenMarketplace={() => openApp(AppType.MARKETPLACE)} settings={settings} onUpdateSettings={handleUpdateSettings} onBackup={handleBackup} />;
            case AppType.MARKETPLACE: return <MarketplaceApp installedApps={installedApps} setInstalledApps={handleSetApps} userJob={userData?.job || 'unemployed'} />;
            case AppType.BROWSER: return <BrowserApp />;
            case AppType.CAMERA: return <CameraApp />;
            case AppType.MUSIC: return <MusicApp songs={songs} setSongs={handleSetSongs} />;
            case AppType.GARAGE: return <GarageApp vehicles={vehicles} onRequestVehicle={handleRequestVehicle} />;
            case AppType.BANK: return <BankApp account={bankAccount} onTransfer={handleBankTransfer} />;
            case AppType.BUSINESSES: return <BusinessApp businesses={businesses} onSetGPS={handleSetBusinessGPS} />;
            case AppType.DISPATCH: return <DispatchApp alerts={alerts} onCreateAlert={handleCreateAlert} />;
            case AppType.WEATHER: return <WeatherApp locale={locale as 'en' | 'fr'} />;
            case AppType.MAIL: return <MailApp mails={mails} myEmailAddress={userData?.email || "me@ls.mail"} onSend={handleSendMail} onDelete={handleDeleteMail} />;
            case AppType.SOCIAL: return <SocialApp posts={socialPosts} onCreatePost={handleCreatePost} onLikePost={handleLikePost} />;
            
            // Job Apps
            case AppType.MDT: return <MdtApp onSetDuty={handleSetDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchCitizens={handleSearchCitizens} onCreateIncident={handleCreateIncident} />;
            case AppType.MEDITAB: return <MediTab onSetDuty={handleSetDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchRecords={handleSearchMedicalRecords} onCreateRecord={handleCreateMedicalRecord} />;
            case AppType.MECHATAB: return <MechaTab onSetDuty={handleSetDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchVehicle={handleSearchVehicleInfo} onCreateInvoice={handleCreateInvoice} invoices={mechanicInvoices} />;

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
                    locale={locale as 'en' | 'fr'} 
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
