
import type { AppInfo, Wallpaper } from './types';
import { AppType } from './types';
import { 
    Phone, MessageCircle, Settings, Globe, Camera, LayoutGrid, Landmark, Car, Siren, Building2, Users, Music, Mail, Sun, Image, Clock, Map, NotebookText, ListTodo, AreaChart, Heart, Wallet
} from 'lucide-react';

export const MY_PHONE_NUMBER = "555-0123";

export const ALL_APPS: AppInfo[] = [
    // System Apps (Non-removable)
    { id: AppType.PHONE, name: 'phone_title', icon: Phone, color: 'text-white', bgColor: 'bg-green-500', isRemovable: false },
    { id: AppType.MESSAGES, name: 'messages_title', icon: MessageCircle, color: 'text-white', bgColor: 'bg-blue-500', notificationCount: 0, isRemovable: false },
    { id: AppType.SETTINGS, name: 'settings_title', icon: Settings, color: 'text-neutral-800', bgColor: 'bg-neutral-200', isRemovable: false },
    { id: AppType.BROWSER, name: 'browser_title', icon: Globe, color: 'text-blue-500', bgColor: 'bg-white', isRemovable: false },
    { id: AppType.BANK, name: 'bank_title', icon: Landmark, color: 'text-white', bgColor: 'bg-emerald-500', isRemovable: false },
    { id: AppType.MARKETPLACE, name: 'app_store_title', icon: LayoutGrid, color: 'text-white', bgColor: 'bg-sky-500', isRemovable: false },
    
    // Functional Apps (Non-removable for now, can be changed)
    { id: AppType.CAMERA, name: 'camera_title', icon: Camera, color: 'text-neutral-300', bgColor: 'bg-neutral-800', isRemovable: false },
    { id: AppType.GARAGE, name: 'garage_title', icon: Car, color: 'text-white', bgColor: 'bg-orange-500', isRemovable: false },
    { id: AppType.DISPATCH, name: 'dispatch_title', icon: Siren, color: 'text-white', bgColor: 'bg-red-500', isRemovable: false },
    { id: AppType.BUSINESSES, name: 'businesses_title', icon: Building2, color: 'text-white', bgColor: 'bg-cyan-500', isRemovable: false },

    // Optional Apps (Removable)
    { id: AppType.SOCIAL, name: 'social_title', icon: Users, color: 'text-white', bgColor: 'bg-purple-500', isRemovable: true },
    { id: AppType.MUSIC, name: 'music_title', icon: Music, color: 'text-white', bgColor: 'bg-rose-500', isRemovable: true },
    { id: AppType.MAIL, name: 'mail_title', icon: Mail, color: 'text-white', bgColor: 'bg-sky-400', isRemovable: true },
    { id: AppType.WEATHER, name: 'weather_title', icon: Sun, color: 'text-yellow-300', bgColor: 'bg-blue-400', isRemovable: true },
    { id: AppType.PHOTOS, name: 'photos_title', icon: Image, color: 'text-rose-500', bgColor: 'bg-white', isRemovable: true },
    { id: AppType.CLOCK, name: 'clock_title', icon: Clock, color: 'text-white', bgColor: 'bg-black', isRemovable: true },
    { id: AppType.MAPS, name: 'maps_title', icon: Map, color: 'text-white', bgColor: 'bg-green-600', isRemovable: true },
    { id: AppType.NOTES, name: 'notes_title', icon: NotebookText, color: 'text-neutral-800', bgColor: 'bg-yellow-300', isRemovable: true },
    { id: AppType.REMINDERS, name: 'reminders_title', icon: ListTodo, color: 'text-black', bgColor: 'bg-white', isRemovable: true },
    { id: AppType.STOCKS, name: 'stocks_title', icon: AreaChart, color: 'text-white', bgColor: 'bg-neutral-800', isRemovable: true },
    { id: AppType.HEALTH, name: 'health_title', icon: Heart, color: 'text-red-500', bgColor: 'bg-white', isRemovable: true },
    { id: AppType.WALLET, name: 'wallet_title', icon: Wallet, color: 'text-white', bgColor: 'bg-black', isRemovable: true },
];

export const DEFAULT_DOCK_APP_IDS = [AppType.PHONE, AppType.BROWSER, AppType.MESSAGES, AppType.SETTINGS];
export const MAX_DOCK_APPS = 4;

export const DEFAULT_WALLPAPERS: Wallpaper[] = [
    { id: 'ios_default_new', name: 'iOS Default', url: 'https://i.pinimg.com/originals/8c/f4/98/8cf498ef295f66b4f987405af2d810c3.jpg' },
    { id: 'aurora', name: 'Aurora', url: 'https://w.forfun.com/fetch/1e/1e07353155359a933f7d8c6a28e5a759.jpeg' },
    { id: 'mountain', name: 'Mountain', url: 'https://w.forfun.com/fetch/03/03a74ac7d4a20b9231478174f7626372.jpeg' },
    { id: 'abstract', name: 'Abstract', url: 'https://w.forfun.com/fetch/51/5129c158652453e0791483861c8a1639.jpeg' },
    { id: 'wave', name: 'Wave', url: 'https://w.forfun.com/fetch/d4/d4a460144dedb95768a49c6d17960682.jpeg' },
    { id: 'city', name: 'City', url: 'https://w.forfun.com/fetch/e0/e0cf3b9f3d2427a7eb9f272a74c602a8.jpeg' },
];
