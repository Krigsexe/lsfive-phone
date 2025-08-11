
import React from 'react';
import type { AppInfo } from '../types';
import { useLocale } from '../i18n';

interface AppIconProps {
    app: AppInfo;
    onClick: () => void;
    isDocked?: boolean;
    isDraggable?: boolean;
    isDragging?: boolean;
    onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void;
    onDragEnd?: () => void;
}

const AppIcon: React.FC<AppIconProps> = (props) => {
    const { 
        app, onClick, isDocked = false, isDraggable = false, isDragging = false,
        onDragStart, onDragEnd 
    } = props;
    const { t } = useLocale();

    const renderIcon = () => {
        const IconComponent = app.icon;
        return <IconComponent className={`${app.color} w-12 h-12`} style={{ filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.4))' }} />;
    };

    return (
        <button 
            onClick={onClick}
            draggable={isDraggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            data-appid={app.id}
            data-dropzone={isDocked ? 'dock' : 'main'}
            className={`flex flex-col items-center group w-24 h-28 transition-transform duration-200 ease-in-out ${isDocked ? 'justify-center' : 'justify-start gap-2'} ${isDragging ? 'opacity-30 scale-110' : 'opacity-100'}`}
            aria-label={t(app.name)}
        >
            <div className={`w-20 h-20 rounded-[1.3rem] flex items-center justify-center relative transition-transform duration-200 group-active:scale-95 overflow-hidden pointer-events-none ${app.bgColor || 'bg-neutral-800'}`}>
                {renderIcon()}
                 
                {app.notificationCount > 0 && (
                     <div 
                        className="absolute top-1 right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-[var(--bg-primary)]"
                        role="status"
                        aria-label="New notification"
                     ></div>
                )}
            </div>
            {!isDocked && <span className="text-white text-sm font-medium drop-shadow-lg pointer-events-none" style={{textShadow: '0 1px 2px rgb(0 0 0 / 0.7)'}}>{t(app.name)}</span>}
        </button>
    );
};

export default AppIcon;
