
import React, { useState } from 'react';
import type { DispatchAlert, DispatchDepartmentInfo } from '../../types';
import { DispatchDepartment } from '../../types';
import { Shield, HeartPulse, MapPin, Plus, X, Flame, User, Siren } from 'lucide-react';
import { useLocale } from '../../i18n';

const DEPARTMENTS_INFO: Record<DispatchDepartment, DispatchDepartmentInfo> = {
    [DispatchDepartment.POLICE]: { color: "bg-blue-500", icon: Shield },
    [DispatchDepartment.AMBULANCE]: { color: "bg-red-500", icon: HeartPulse },
    [DispatchDepartment.FIRE]: { color: "bg-orange-500", icon: Flame },
    [DispatchDepartment.CITIZEN]: { color: "bg-gray-500", icon: User },
};

interface DispatchAppProps {
    alerts: DispatchAlert[];
    onCreateAlert: (data: { title: string, details: string, location: string }) => void;
}

const DispatchApp: React.FC<DispatchAppProps> = ({ alerts, onCreateAlert }) => {
    const { t } = useLocale();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const CreateAlertModal: React.FC = () => {
        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
                title: formData.get('title') as string,
                details: formData.get('details') as string,
                location: formData.get('location') as string
            };
            onCreateAlert(data);
            setIsModalOpen(false);
        }

        return (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4">
                <div className="bg-neutral-800 rounded-2xl p-6 w-full max-w-sm relative">
                    <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-2 p-2 text-neutral-400 hover:text-white"><X size={24}/></button>
                    <h2 className="text-xl font-bold text-white mb-4">{t('create_alert')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input name="title" type="text" placeholder={t('title')} className="w-full bg-neutral-700 p-3 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500" required />
                        <textarea name="details" placeholder={t('details')} rows={3} className="w-full bg-neutral-700 p-3 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500" required />
                        <input name="location" type="text" placeholder={t('location')} className="w-full bg-neutral-700 p-3 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500" required />
                        <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors">{t('send_alert')}</button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-transparent text-white h-full flex flex-col">
            <header className="p-4 bg-black/30 backdrop-blur-xl sticky top-0 z-10 border-b border-neutral-800 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">{t('dispatch_title')}</h1>
                <button onClick={() => setIsModalOpen(true)} className="p-2 text-white bg-white/10 rounded-full hover:bg-white/20"><Plus size={24} /></button>
            </header>
            <div className="p-2 space-y-3 overflow-y-auto flex-grow">
                {alerts.length > 0 ? (
                    alerts.map((alert) => {
                        const deptInfo = DEPARTMENTS_INFO[alert.department];
                        const DeptIcon = deptInfo.icon;
                        return (
                            <div key={alert.id} className="bg-neutral-900/80 rounded-xl p-4 border-l-4" style={{ borderColor: deptInfo.color.replace('bg-', '').split('-')[0] === 'blue' ? '#3b82f6' : deptInfo.color.replace('bg-', '').split('-')[0] === 'red' ? '#ef4444' : deptInfo.color.replace('bg-', '').split('-')[0] === 'orange' ? '#f97316' : '#6b7280' }}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deptInfo.color}`}>
                                            <DeptIcon size={22} />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-base">{alert.title}</h2>
                                            <p className="text-sm text-slate-300">{alert.details}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400 flex-shrink-0">{alert.timestamp}</span>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-slate-400 text-sm pl-14">
                                    <MapPin size={14} />
                                    <span>{alert.location}</span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-slate-400 p-12 flex-grow flex flex-col justify-center items-center -mt-16">
                        <Siren size={48} className="mx-auto text-slate-500 mb-2" />
                        <h3 className="font-semibold text-lg">{t('no_alerts')}</h3>
                        <p className="text-sm">{t('no_alerts_desc')}</p>
                    </div>
                )}
            </div>
            {isModalOpen && <CreateAlertModal />}
        </div>
    );
};

export default DispatchApp;
