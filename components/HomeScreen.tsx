
import React, { useState, useRef, useEffect } from 'react';
import type { AppInfo, MusicState, Song, WidgetType } from '../types';
import { AppType } from '../types';
import AppIcon from './AppIcon';
import { MAX_DOCK_APPS } from '../constants';
import MainScreenView from './MainScreenView';

interface HomeScreenProps {
    apps: AppInfo[];
    setApps: (apps: AppInfo[]) => void;
    dockAppIds: AppType[];
    setDockAppIds: (ids: AppType[]) => void;
    onOpenApp: (appId: AppType) => void;
    locale: 'en' | 'fr';
    musicState: MusicState;
    onTogglePlay: () => void;
    onSelectSong: (song: Song) => void;
    isEditMode: boolean;
    setIsEditMode: (isEditing: boolean) => void;
    onRemoveApp: (appId: AppType) => void;
    widgets: WidgetType[];
    setWidgets: (widgets: WidgetType[]) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = (props) => {
    const { apps, setApps, dockAppIds, setDockAppIds, onOpenApp, isEditMode, setIsEditMode, onRemoveApp } = props;
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const longPressTimeout = useRef<number | null>(null);

    const dockApps = dockAppIds.map(id => apps.find(app => app.id === id)).filter((app): app is AppInfo => !!app);
    
    const handleInteractionStart = () => {
        if (isEditMode) return;
        longPressTimeout.current = window.setTimeout(() => {
            setIsEditMode(true);
        }, 500); // 500ms for long press
    };

    const handleInteractionEnd = () => {
        if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLElement>, id: string, type: 'app' | 'widget') => {
        const dragData = JSON.stringify({ id, type });
        e.dataTransfer.setData('application/json', dragData);
        setDraggedItemId(id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDraggedItemId(null);
        
        const sourceData = JSON.parse(e.dataTransfer.getData('application/json'));
        if (!sourceData) return;
        
        // This logic remains largely the same for apps, but would need to be expanded for widgets
        if (sourceData.type === 'app') {
            handleAppDrop(e, sourceData.id);
        }
    };
    
    const handleAppDrop = (e: React.DragEvent<HTMLDivElement>, sourceAppId: AppType) => {
        let dropElement = document.elementFromPoint(e.clientX, e.clientY);
        let targetButton = dropElement?.closest('button[data-appid]');
        let targetDropzoneDiv = dropElement?.closest('div[data-dropzone]');

        const targetAppId = targetButton?.getAttribute('data-appid') as AppType | null;
        const dropZone = targetDropzoneDiv?.getAttribute('data-dropzone') as 'main' | 'dock' | null;

        if (!dropZone) return;

        const sourceIsDocked = dockAppIds.includes(sourceAppId);
        
        if (dropZone === 'main') {
            if (sourceIsDocked) { // Dock -> Main
                const newDockIds = dockAppIds.filter(id => id !== sourceAppId);
                setDockAppIds(newDockIds);
                if (targetAppId) {
                    const reorderedApps = [...apps];
                    const sourceIdx = reorderedApps.findIndex(a => a.id === sourceAppId);
                    if (sourceIdx === -1) return;
                    const [movedItem] = reorderedApps.splice(sourceIdx, 1);
                    const targetIdx = reorderedApps.findIndex(a => a.id === targetAppId);
                    reorderedApps.splice(targetIdx, 0, movedItem);
                    setApps(reorderedApps);
                }
            } else { // Main -> Main
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
            if (sourceIsDocked) { // Dock -> Dock
                 if (sourceAppId === targetAppId) return;
                 const reorderedDockIds = [...dockAppIds];
                 const sourceIdx = reorderedDockIds.indexOf(sourceAppId);
                 if (sourceIdx === -1) return;
                 reorderedDockIds.splice(sourceIdx, 1);
                 const targetIdx = targetAppId ? reorderedDockIds.indexOf(targetAppId) : reorderedDockIds.length;
                 reorderedDockIds.splice(targetIdx, 0, sourceAppId);
                 setDockAppIds(reorderedDockIds);
            } else { // Main -> Dock
                if (dockAppIds.length >= MAX_DOCK_APPS) return;
                const newDockIds = [...dockAppIds];
                const targetIdx = targetAppId ? newDockIds.indexOf(targetAppId) : newDockIds.length;
                newDockIds.splice(targetIdx, 0, sourceAppId);
                setDockAppIds(newDockIds);
            }
        }
    };


    const handleDragEnd = () => {
        setDraggedItemId(null);
    };

    return (
        <div className="h-full flex flex-col justify-end" onTouchStart={handleInteractionStart} onTouchEnd={handleInteractionEnd} onMouseDown={handleInteractionStart} onMouseUp={handleInteractionEnd} onMouseLeave={handleInteractionEnd}>
            <MainScreenView
                {...props}
                draggedItemId={draggedItemId}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
            />

            {/* Dock */}
            <div className="px-2 pb-1 relative">
                <div 
                    className="p-2 bg-black/20 backdrop-blur-2xl rounded-3xl w-full"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    data-dropzone="dock"
                >
                    <div className="grid grid-cols-4 gap-x-2 justify-items-center">
                        {dockApps.map((app) => (
                             <AppIcon
                                key={app.id}
                                app={app}
                                onClick={() => onOpenApp(app.id)}
                                isDocked={true}
                                isDraggable={isEditMode}
                                isDragging={draggedItemId === app.id}
                                onDragStart={(e) => handleDragStart(e, app.id, 'app')}
                                onDragEnd={handleDragEnd}
                                isEditMode={isEditMode}
                                onRemove={onRemoveApp}
                            />
                        ))}
                    </div>
                </div>
                 {isEditMode && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                        <button onClick={() => setIsEditMode(false)} className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-full shadow-lg">Done</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeScreen;