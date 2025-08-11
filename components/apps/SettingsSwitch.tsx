
import React from 'react';

interface SettingsSwitchProps {
    icon: React.ElementType;
    color: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const SettingsSwitch: React.FC<SettingsSwitchProps> = ({ icon: Icon, color, label, checked, onChange }) => (
    <div className="flex items-center gap-4 p-3 first:rounded-t-xl last:rounded-b-xl">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
            <Icon size={20} className="text-white"/>
        </div>
        <span className="flex-grow font-medium text-base text-[var(--text-primary)]">{label}</span>
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-[31px] w-[51px] items-center rounded-full transition-colors duration-200 ease-in-out
            ${checked ? 'bg-[var(--accent-green)]' : 'bg-neutral-700'}`}
        >
            <span
                className="inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-sm ring-1 ring-black ring-opacity-5 transition-transform duration-200 ease-in-out"
                style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
            />
        </button>
    </div>
);

export default SettingsSwitch;