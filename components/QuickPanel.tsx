
import React from 'react';
import type { Notification, MusicState, PhoneSettings } from '../types';
import { X, Wifi, Signal, Plane, Moon, Sun, Volume2, Music2, Play, Pause, Bell } from 'lucide-react';
import { useLocale } from '../i18n';

interface QuickPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onClearNotifications: () => void;
    musicState: MusicState;
    onTogglePlay: () => void;
    settings: PhoneSettings;
    onUpdateSettings: (updates: Partial<PhoneSettings>) => void;
}

const QuickPanel: React.FC<QuickPanelProps> = (props) => {
    const { isOpen, onClose, notifications, onClearNotifications, musicState, onTogglePlay, settings, onUpdateSettings } = props;
    const { t } = useLocale();
    const { currentSong, isPlaying } = musicState;

    if (!isOpen) {
        return null;
    }

    const ControlButton: React.FC<{ icon: React.ElementType, active?: boolean, onClick?: () => void }> = ({ icon: Icon, active, onClick }) => (
        <button onClick={onClick} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-blue-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
            <Icon size={22} />
        </button>
    );

    return (
        <div 
            className="absolute inset-0 z-50 transition-opacity duration-300"
            style={{
                backgroundColor: 'rgba(0,0,0,0.3)',
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'auto' : 'none',
            }}
            onClick={onClose}
        >
            <div 
                className="absolute top-4 left-4 right-4 bg-black/40 backdrop-blur-2xl rounded-3xl p-3 text-white space-y-3 transition-transform duration-300"
                style={{ transform: isOpen ? 'translateY(0)' : 'translateY(-110%)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Controls */}
                <div className="grid grid-cols-4 gap-2">
                     <ControlButton icon={Plane} active={settings.airplaneMode} onClick={() => onUpdateSettings({ airplaneMode: !settings.airplaneMode })} />
                     <ControlButton icon={Signal} active={true} />
                     <ControlButton icon={Wifi} active={true} />
                     <ControlButton icon={settings.theme === 'dark' ? Moon : Sun} active={true} onClick={() => onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}/>
                </div>

                {/* Sliders */}
                <div className="bg-black/20 rounded-2xl p-2 flex items-center gap-3">
                    <Sun size={20} className="text-neutral-300" />
                    <input type="range" className="w-full h-1.5 bg-neutral-700 rounded-full appearance-none" style={{accentColor: 'white'}} defaultValue="80" />
                </div>
                 <div className="bg-black/20 rounded-2xl p-2 flex items-center gap-3">
                    <Volume2 size={20} className="text-neutral-300" />
                    <input type="range" className="w-full h-1.5 bg-neutral-700 rounded-full appearance-none" style={{accentColor: 'white'}} defaultValue="50" />
                </div>

                {/* Music Player */}
                <div className="bg-black/20 rounded-2xl p-2 flex items-center gap-3">
                    <div className="w-11 h-11 bg-neutral-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        {currentSong?.artwork ? <img src={currentSong.artwork} className="w-full h-full object-cover rounded-lg" /> : <Music2 size={24} className="text-neutral-400" />}
                    </div>
                    <div className="flex-grow overflow-hidden">
                        <p className="font-semibold text-sm truncate">{currentSong?.title || "Not Playing"}</p>
                        <p className="text-xs text-neutral-400 truncate">{currentSong?.artist || "Open Music app"}</p>
                    </div>
                    <button onClick={onTogglePlay} disabled={!currentSong} className="p-2 text-white disabled:text-neutral-600">
                        {isPlaying ? <Pause size={24} fill="currentColor"/> : <Play size={24} fill="currentColor"/>}
                    </button>
                </div>

                {/* Notifications */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notifications.length > 0 ? (
                        <>
                            <div className="flex justify-between items-center px-1">
                                <h3 className="font-bold text-lg">Notifications</h3>
                                <button onClick={onClearNotifications} className="text-sm text-blue-400 hover:text-blue-300">Clear</button>
                            </div>
                            {notifications.map(notif => {
                                const NotifIcon = notif.icon;
                                return (
                                    <div key={notif.id} className="bg-black/20 rounded-xl p-2.5 flex items-center gap-3">
                                        <NotifIcon size={20} className="text-neutral-300 flex-shrink-0" />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm">{notif.title}</p>
                                            <p className="text-xs text-neutral-300">{notif.message}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <div className="text-center p-6 text-neutral-500">
                            <Bell size={32} className="mx-auto" />
                            <p className="mt-1 text-sm font-semibold">No new notifications</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuickPanel;