
import React from 'react';
import type { MusicState, Song } from '../../types';
import { Play, Pause, StepForward, StepBack, Music2 } from 'lucide-react';

interface MusicWidgetProps {
    musicState: MusicState;
    onTogglePlay: () => void;
    onSelectSong: (song: Song) => void;
}

const MusicWidget: React.FC<MusicWidgetProps> = ({ musicState, onTogglePlay }) => {
    const { currentSong, isPlaying } = musicState;

    if (!currentSong) {
        return (
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white/50 shadow-lg flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-700/50 rounded-lg flex items-center justify-center">
                    <Music2 size={24} />
                </div>
                <div className="flex-grow">
                    <p className="font-semibold">No Music Playing</p>
                    <p className="text-sm">Open the Music app to start.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-3 text-white shadow-lg flex items-center gap-3">
            <img 
                src={currentSong.artwork || 'https://via.placeholder.com/64'} 
                alt={currentSong.title}
                className="w-14 h-14 rounded-lg object-cover bg-neutral-700"
            />
            <div className="flex-grow overflow-hidden">
                <p className="font-bold truncate">{currentSong.title}</p>
                <p className="text-sm text-neutral-300 truncate">{currentSong.artist}</p>
            </div>
            <div className="flex items-center gap-2 pr-1">
                <button className="p-2 text-neutral-300 hover:text-white"><StepBack size={24} fill="currentColor"/></button>
                <button onClick={onTogglePlay} className="p-2 text-white">
                    {isPlaying ? <Pause size={28} fill="currentColor"/> : <Play size={28} fill="currentColor"/>}
                </button>
                <button className="p-2 text-neutral-300 hover:text-white"><StepForward size={24} fill="currentColor"/></button>
            </div>
        </div>
    );
};

export default MusicWidget;