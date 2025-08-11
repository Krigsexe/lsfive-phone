
import React from 'react';
import ClockWidget from './widgets/ClockWidget';
import MusicWidget from './widgets/MusicWidget';
import WidgetWrapper from './widgets/WidgetWrapper';
import type { MusicState, Song, WidgetType } from '../types';
import { WidgetType as WidgetTypeEnum } from '../types';

interface WidgetScreenProps {
    locale: 'en' | 'fr';
    musicState: MusicState;
    onTogglePlay: () => void;
    onSelectSong: (song: Song) => void;
    isEditMode: boolean;
    widgets: WidgetType[];
    setWidgets: (widgets: WidgetType[]) => void;
}

const WidgetScreen: React.FC<WidgetScreenProps> = (props) => {
    const { locale, musicState, onTogglePlay, onSelectSong, isEditMode, widgets, setWidgets } = props;

    const onRemoveWidget = (widgetId: WidgetType) => {
        setWidgets(widgets.filter(w => w !== widgetId));
    };

    const renderWidget = (widgetType: WidgetType) => {
        switch (widgetType) {
            case WidgetTypeEnum.CLOCK:
                return <ClockWidget locale={locale} />;
            case WidgetTypeEnum.MUSIC:
                return <MusicWidget 
                            musicState={musicState}
                            onTogglePlay={onTogglePlay}
                            onSelectSong={onSelectSong}
                        />;
            default:
                return null;
        }
    };
    
    return (
        <div className="h-full flex flex-col gap-4">
            {widgets.map(widgetType => (
                <WidgetWrapper 
                    key={widgetType}
                    isEditMode={isEditMode}
                    onRemove={() => onRemoveWidget(widgetType)}
                >
                    {renderWidget(widgetType)}
                </WidgetWrapper>
            ))}
        </div>
    );
};

export default WidgetScreen;