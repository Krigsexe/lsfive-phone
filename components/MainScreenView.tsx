
import React, { useState, useRef, useEffect } from 'react';
import type { AppInfo, MusicState, Song, WidgetType } from '../types';
import { AppType } from '../types';
import AppIcon from './AppIcon';
import WidgetScreen from './WidgetScreen';

interface MainScreenViewProps {
    apps: AppInfo[];
    dockAppIds: AppType[];
    onOpenApp: (appId: AppType) => void;
    locale: 'en' | 'fr';
    musicState: MusicState;
    onTogglePlay: () => void;
    onSelectSong: (song: Song) => void;
    isEditMode: boolean;
    onRemoveApp: (appId: AppType) => void;
    draggedItemId: string | null;
    onDragStart: (e: React.DragEvent<HTMLElement>, id: string, type: 'app' | 'widget') => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: () => void;
    widgets: WidgetType[];
    setWidgets: (widgets: WidgetType[]) => void;
}

const APPS_PER_PAGE = 24; // 4 columns x 6 rows

const MainScreenView: React.FC<MainScreenViewProps> = (props) => {
    const { apps, dockAppIds, onOpenApp, locale, musicState, onTogglePlay, onSelectSong, isEditMode, onRemoveApp } = props;
    const { draggedItemId, onDragStart, onDragOver, onDrop, onDragEnd, widgets, setWidgets } = props;

    const [currentPage, setCurrentPage] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);
    
    const mainApps = apps.filter(app => !dockAppIds.includes(app.id));
    const pageCount = Math.max(1, Math.ceil(mainApps.length / APPS_PER_PAGE));
    const totalPages = 1 + pageCount; // 1 for widgets

    useEffect(() => {
        const handleScroll = () => {
            if (scrollContainerRef.current) {
                const { scrollLeft, clientWidth } = scrollContainerRef.current;
                const page = Math.round(scrollLeft / clientWidth);
                if (page !== currentPage) {
                    setCurrentPage(page);
                }
            }
        };

        const scroller = scrollContainerRef.current;
        scroller?.addEventListener('scroll', handleScroll, { passive: true });
        return () => scroller?.removeEventListener('scroll', handleScroll);
    }, [currentPage]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        isDragging.current = true;
        startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
        scrollLeftStart.current = scrollContainerRef.current.scrollLeft;
        scrollContainerRef.current.style.cursor = 'grabbing';
        scrollContainerRef.current.style.scrollSnapType = 'none';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; // Multiply for faster scrolling
        scrollContainerRef.current.scrollLeft = scrollLeftStart.current - walk;
    };

    const handleMouseUp = () => {
        if (!scrollContainerRef.current) return;
        isDragging.current = false;
        scrollContainerRef.current.style.cursor = 'grab';
        
        const { scrollLeft, clientWidth } = scrollContainerRef.current;
        const page = Math.round(scrollLeft / clientWidth);
        
        scrollContainerRef.current.style.scrollSnapType = 'x mandatory';
        scrollContainerRef.current.scrollTo({
            left: page * clientWidth,
            behavior: 'smooth'
        });
    };
    
    return (
        <div className="flex-grow flex flex-col pt-12">
            <div 
                ref={scrollContainerRef}
                className="flex-grow flex overflow-x-auto scroll-snap-type-x-mandatory scrollbar-hide select-none"
                style={{ cursor: 'grab' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Page 0: Widgets */}
                <div className="w-full h-full flex-shrink-0 scroll-snap-align-center p-4">
                    <WidgetScreen 
                        {...props}
                    />
                </div>

                {/* App Pages */}
                {Array.from({ length: pageCount }).map((_, pageIndex) => (
                    <div 
                        key={pageIndex} 
                        className="w-full h-full flex-shrink-0 scroll-snap-align-center p-4"
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        data-dropzone="main"
                    >
                        <div className="grid grid-cols-4 grid-rows-6 gap-y-4 gap-x-2 content-start h-full">
                            {mainApps.slice(pageIndex * APPS_PER_PAGE, (pageIndex + 1) * APPS_PER_PAGE).map((app) => (
                                <AppIcon
                                    key={app.id}
                                    app={app}
                                    isDraggable={isEditMode}
                                    isDragging={draggedItemId === app.id}
                                    onClick={() => onOpenApp(app.id)}
                                    onDragStart={(e) => onDragStart(e, app.id, 'app')}
                                    onDragEnd={onDragEnd}
                                    isEditMode={isEditMode}
                                    onRemove={onRemoveApp}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Pagination Dots */}
            <div className="flex justify-center items-center gap-2 h-6">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${currentPage === i ? 'bg-white' : 'bg-white/40'}`} />
                ))}
            </div>
        </div>
    );
};

export default MainScreenView;