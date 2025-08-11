
import React, { useState, useRef } from 'react';
import { ChevronLeft, Check, Upload, Link } from 'lucide-react';
import type { Wallpaper } from '../../types';
import { useLocale } from '../../i18n';

interface WallpaperSettingsProps {
    onBack: () => void;
    onSelectWallpaper: (url: string) => void;
    wallpapers: Wallpaper[];
    setWallpapers: (wallpapers: Wallpaper[]) => void;
}

const WallpaperSettings: React.FC<WallpaperSettingsProps> = ({ onBack, onSelectWallpaper, wallpapers, setWallpapers }) => {
    const { t } = useLocale();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [newWallpaperUrl, setNewWallpaperUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSelect = (wallpaper: Wallpaper) => {
        onSelectWallpaper(wallpaper.url);
        setSelectedId(wallpaper.id);
    };

    const handleAddByUrl = () => {
        if (newWallpaperUrl.trim()) {
            const newWallpaper: Wallpaper = {
                id: `custom-${Date.now()}`,
                name: 'Custom URL',
                url: newWallpaperUrl.trim(),
                isCustom: true,
            };
            setWallpapers([...wallpapers, newWallpaper]);
            setNewWallpaperUrl('');
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newWallpaper: Wallpaper = {
                    id: `custom-${Date.now()}`,
                    name: file.name,
                    url: e.target?.result as string,
                    isCustom: true,
                };
                setWallpapers([...wallpapers, newWallpaper]);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="h-full overflow-y-auto">
            <header className="p-2 bg-[var(--bg-secondary)]/80 backdrop-blur-xl flex items-center sticky top-0 border-b border-[var(--border-color)] z-10">
                <button onClick={onBack} className="text-[var(--accent-blue)] p-2 flex items-center">
                    <ChevronLeft size={28} className="-ml-2"/>
                    <span className="text-base -ml-1">{t('settings_title')}</span>
                </button>
                <h1 className="text-lg font-bold text-[var(--text-primary)] absolute left-1/2 -translate-x-1/2">{t('wallpaper')}</h1>
            </header>
            
            <div className="p-4 space-y-4">
                <div className="bg-neutral-900/80 rounded-xl p-3 space-y-3">
                    <h2 className="font-semibold text-lg">Add New Wallpaper</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newWallpaperUrl}
                            onChange={(e) => setNewWallpaperUrl(e.target.value)}
                            placeholder="Paste image URL..."
                            className="flex-grow bg-neutral-700 p-2 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button onClick={handleAddByUrl} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 rounded-lg transition-colors"><Link size={20}/></button>
                    </div>
                     <button onClick={triggerFileUpload} className="w-full flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2 rounded-lg transition-colors">
                        <Upload size={20}/>
                        Upload from device
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {wallpapers.map(wallpaper => (
                        <div key={wallpaper.id} className="relative cursor-pointer group" onClick={() => handleSelect(wallpaper)}>
                            <img src={wallpaper.url} alt={wallpaper.name} className="w-full h-48 object-cover rounded-lg"/>
                            <div className="absolute inset-0 bg-black/20 rounded-lg group-hover:bg-black/40 transition-all flex items-center justify-center">
                               {selectedId === wallpaper.id && (
                                   <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                       <Check size={20} className="text-white" />
                                   </div>
                               )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WallpaperSettings;