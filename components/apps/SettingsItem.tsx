
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SettingsItemProps {
    icon: React.ElementType;
    color: string;
    label: string;
    onClick: () => void;
    value?: string;
    hasDivider?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ icon: Icon, color, label, onClick, value, hasDivider = true }) => (
    <>
        <div onClick={onClick} className="flex items-center gap-4 p-3 cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors duration-100 first:rounded-t-xl last:rounded-b-xl">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={20} className="text-white"/>
            </div>
            <span className="flex-grow font-medium text-base text-[var(--text-primary)]">{label}</span>
            <div className="flex items-center gap-2">
                {value && <span className="text-base text-[var(--text-secondary)]">{value}</span>}
                <ChevronRight size={22} className="text-[var(--text-tertiary)]"/>
            </div>
        </div>
        {hasDivider && <div className="border-b border-[var(--border-color)] ml-16"></div>}
    </>
);

export default SettingsItem;