
import React from 'react';
import type { AppInfo } from '../types';
import { AppType } from '../types';
import { useLocale } from '../i18n';
import { X } from 'lucide-react';

interface AppIconProps {
    app: AppInfo;
    onClick: () => void;
    isDocked?: boolean;
    isDraggable?: boolean;
    isDragging?: boolean;
    onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void;
    onDragEnd?: () => void;
    isEditMode: boolean;
    onRemove: (appId: AppType) => void;
}

const AppIcon: React.FC<AppIconProps> = (props) => {
    const { 
        app, onClick, isDocked = false, isDraggable = false, isDragging = false,
        onDragStart, onDragEnd, isEditMode, onRemove
    } = props;
    const { t } = useLocale();
    
    const handleRemoveClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent onClick from firing
        onRemove(app.id);
    };

    const renderIcon = () => {
        const IconComponent = app.icon;
        return <IconComponent className={`${app.color} w-8 h-8`} style={{ filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.4))' }} />;
    };

    return (
        <button 
            onClick={onClick}
            draggable={isDraggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            data-appid={app.id}
            data-dropzone={isDocked ? 'dock' : 'main'}
            className={`flex flex-col items-center group w-20 h-24 transition-transform duration-200 ease-in-out relative ${isDocked ? 'justify-center' : 'justify-start pt-1 gap-1'} ${isDragging ? 'opacity-30 scale-110' : 'opacity-100'} ${isEditMode ? 'jiggle' : ''}`}
            aria-label={t(app.name)}
        >
            {isEditMode && app.isRemovable && (
                <button onClick={handleRemoveClick} className="remove-btn">
                    <X size={16} />
                </button>
            )}
            <div className={`w-16 h-16 flex items-center justify-center relative transition-transform duration-200 group-active:scale-95 overflow-hidden pointer-events-none ${app.bgColor || 'bg-neutral-800'}`} style={{ borderRadius: '22.5%'}}>
                {renderIcon()}
                 
                {app.notificationCount > 0 && (
                     <div 
                        className="absolute -top-1 -right-1 bg-[var(--accent-red)] w-5 h-5 text-xs font-bold text-white flex items-center justify-center rounded-full"
                        role="status"
                        aria-label={`${app.notificationCount} new notifications`}
                     >{app.notificationCount}</div>
                )}
            </div>
            {!isDocked && <span className="text-white text-xs font-medium drop-shadow-lg pointer-events-none w-full truncate px-1" style={{textShadow: '0 1px 2px rgb(0 0 0 / 0.7)'}}>{t(app.name)}</span>}
        </button>
    );
};

export default AppIcon;