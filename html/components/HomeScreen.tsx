
import React, { useState } from 'react';
import type { AppInfo } from '../types';
import { AppType } from '../types';
import AppIcon from './AppIcon';
import { MAX_DOCK_APPS } from '../constants';
import ClockWidget from './ClockWidget';

interface HomeScreenProps {
    apps: AppInfo[];
    setApps: (apps: AppInfo[]) => void;
    dockAppIds: AppType[];
    setDockAppIds: (ids: AppType[]) => void;
    onOpenApp: (appId: AppType) => void;
    locale: 'en' | 'fr';
}

const HomeScreen: React.FC<HomeScreenProps> = ({ apps, setApps, dockAppIds, setDockAppIds, onOpenApp, locale }) => {
    const [draggedAppId, setDraggedAppId] = useState<AppType | null>(null);
    
    const mainApps = apps.filter(app => !dockAppIds.includes(app.id));
    const dockApps = dockAppIds.map(id => apps.find(app => app.id === id)).filter((app): app is AppInfo => !!app);

    const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, app: AppInfo) => {
        e.dataTransfer.setData('appId', app.id);
        setDraggedAppId(app.id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDraggedAppId(null);
        
        const sourceAppId = e.dataTransfer.getData('appId') as AppType;
        if (!sourceAppId) return;

        let dropElement = document.elementFromPoint(e.clientX, e.clientY);
        let targetButton = dropElement?.closest('button[data-appid]');
        let targetDropzoneDiv = dropElement?.closest('div[data-dropzone]');

        const targetAppId = targetButton?.getAttribute('data-appid') as AppType | null;
        const dropZone = targetDropzoneDiv?.getAttribute('data-dropzone') as 'main' | 'dock' | null;

        if (!dropZone) return;

        const sourceIsDocked = dockAppIds.includes(sourceAppId);
        
        if (dropZone === 'main') {
            if (sourceIsDocked) { // Move Dock -> Main
                const newDockIds = dockAppIds.filter(id => id !== sourceAppId);
                setDockAppIds(newDockIds);

                if (targetAppId) { // If dropped on a specific app, reorder
                    const reorderedApps = [...apps];
                    const sourceIdx = reorderedApps.findIndex(a => a.id === sourceAppId);
                    if (sourceIdx === -1) return;
                    
                    const [movedItem] = reorderedApps.splice(sourceIdx, 1);
                    const targetIdx = reorderedApps.findIndex(a => a.id === targetAppId);
                    reorderedApps.splice(targetIdx, 0, movedItem);
                    setApps(reorderedApps);
                }
            } else { // Reorder Main -> Main
                if (!targetAppId || targetAppId === sourceAppId) return;
                const reorderedApps = [...apps];
                const sourceIdx = reorderedApps.findIndex(a => a.id === sourceAppId);
                if (sourceIdx === -1) return;
                
                const [movedItem] = reorderedApps.splice(sourceIdx, 1);
                const targetIdx = reorderedApps.findIndex(a => a.id === targetAppId);
                reorderedApps.splice(targetIdx, 0, movedItem);
                setApps(reorderedApps);
            }
        } else if (dropZone === 'dock') {
            if (sourceIsDocked) { // Reorder Dock -> Dock
                 if (sourceAppId === targetAppId) return;
                 const reorderedDockIds = [...dockAppIds];
                 const sourceIdx = reorderedDockIds.indexOf(sourceAppId);
                 if (sourceIdx === -1) return;
                 
                 reorderedDockIds.splice(sourceIdx, 1);
                 const targetIdx = targetAppId ? reorderedDockIds.indexOf(targetAppId) : reorderedDockIds.length;
                 reorderedDockIds.splice(targetIdx, 0, sourceAppId);
                 setDockAppIds(reorderedDockIds);
            } else { // Move Main -> Dock
                if (dockAppIds.length >= MAX_DOCK_APPS) return;
                
                const newDockIds = [...dockAppIds];
                const targetIdx = targetAppId ? newDockIds.indexOf(targetAppId) : newDockIds.length;
                newDockIds.splice(targetIdx, 0, sourceAppId);
                setDockAppIds(newDockIds);
            }
        }
    };

    const handleDragEnd = () => {
        setDraggedAppId(null);
    };

    return (
        <div 
            className="px-2 pt-1 pb-2 h-full flex flex-col justify-between"
        >
            {/* Top Widget Area */}
            <div className="pt-12 px-10">
                <ClockWidget locale={locale} />
            </div>

            {/* Main App Grid */}
            <div 
                className="flex-grow grid grid-cols-10 gap-y-6 gap-x-4 content-start pt-12 px-8"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                data-dropzone="main"
            >
                {mainApps.map((app) => (
                    <AppIcon
                        key={app.id}
                        app={app}
                        isDraggable={true}
                        isDragging={draggedAppId === app.id}
                        onClick={() => onOpenApp(app.id)}
                        onDragStart={(e) => handleDragStart(e, app)}
                        onDragEnd={handleDragEnd}
                    />
                ))}
            </div>
            
            {/* Dock */}
            <div 
                className="mb-1 p-2 bg-white/10 backdrop-blur-3xl rounded-3xl"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                data-dropzone="dock"
            >
                <div className="grid grid-cols-10 gap-x-2 justify-items-center">
                    {dockApps.map((app) => (
                         <AppIcon
                            key={app.id}
                            app={app}
                            onClick={() => onOpenApp(app.id)}
                            isDocked={true}
                            isDraggable={true}
                            isDragging={draggedAppId === app.id}
                            onDragStart={(e) => handleDragStart(e, app)}
                            onDragEnd={handleDragEnd}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
