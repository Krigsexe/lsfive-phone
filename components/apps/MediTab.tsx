
import React, { useState } from 'react';
import type { OnDutyUnit, MedicalRecord } from '../../types';
import { LayoutDashboard, User, Map, LogOut, LogIn, HeartPulse, Search, Plus, X } from 'lucide-react';
import { useLocale } from '../../i18n';

interface MediTabProps {
    onDuty: boolean;
    onSetDuty: (status: boolean) => void;
    onDutyUnits: OnDutyUnit[];
    onSearchRecords: (query: string) => Promise<MedicalRecord[]>;
    onCreateRecord: (data: any) => void;
}

type MediTabPage = 'dashboard' | 'records' | 'live-map';

const MediTab: React.FC<MediTabProps> = (props) => {
    const { t } = useLocale();
    const [page, setPage] = useState<MediTabPage>('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MedicalRecord[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsLoading(true);
        const results = await props.onSearchRecords(searchQuery);
        setSearchResults(results);
        setIsLoading(false);
    };
    
    const CreateRecordModal = () => {
        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
                patient_identifier: formData.get('patient_id'),
                diagnosis: formData.get('diagnosis'),
                treatment: formData.get('treatment'),
                notes: formData.get('notes'),
            };
            props.onCreateRecord(data);
            setCreateModalOpen(false);
        };
        
        return (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4">
                <div className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg relative">
                     <button onClick={() => setCreateModalOpen(false)} className="absolute top-2 right-2 p-2 text-neutral-400 hover:text-white"><X size={24}/></button>
                     <h2 className="text-xl font-bold text-white mb-4">{t('meditab_create_record')}</h2>
                     <form onSubmit={handleSubmit} className="space-y-3">
                        <input name="patient_id" type="text" placeholder="Patient Identifier" className="w-full bg-neutral-700 p-2 rounded-lg text-white" required />
                        <input name="diagnosis" type="text" placeholder={t('meditab_diagnosis')} className="w-full bg-neutral-700 p-2 rounded-lg text-white" required />
                        <textarea name="treatment" placeholder={t('meditab_treatment')} rows={3} className="w-full bg-neutral-700 p-2 rounded-lg text-white" required />
                        <textarea name="notes" placeholder={t('meditab_notes')} rows={2} className="w-full bg-neutral-700 p-2 rounded-lg text-white" />
                        <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-lg">{t('meditab_submit_record')}</button>
                     </form>
                </div>
            </div>
        );
    };

    const renderPage = () => {
        switch (page) {
            case 'records':
                const selectedPatientRecords = searchResults.filter(r => r.patient_identifier === selectedPatientId);
                return (
                    <div className="flex flex-row h-full">
                        <div className="w-2/5 border-r border-neutral-700/50 flex flex-col">
                            <div className="p-3 border-b border-neutral-700/50">
                                <div className="relative">
                                     <input 
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder={t('meditab_search_placeholder')}
                                        className="w-full bg-neutral-800 p-2.5 pl-10 rounded-lg text-white"
                                    />
                                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                </div>
                                 <button onClick={() => setCreateModalOpen(true)} className="mt-2 w-full bg-rose-600 hover:bg-rose-700 p-2 rounded-lg flex items-center justify-center gap-2">
                                    <Plus size={18} /> {t('meditab_create_record')}
                                </button>
                            </div>
                            <div className="overflow-y-auto flex-grow">
                                {isLoading && <p className="p-4 text-neutral-400">{t('loading')}...</p>}
                                {searchResults.map(rec => (
                                    <div key={rec.id} onClick={() => setSelectedPatientId(rec.patient_identifier)} className={`p-3 cursor-pointer border-b border-neutral-800 hover:bg-neutral-700/50 ${selectedPatientId === rec.patient_identifier ? 'bg-rose-500/20' : ''}`}>
                                        <p className="font-semibold text-white">{rec.patient_identifier}</p>
                                        <p className="text-sm text-neutral-300 truncate">{rec.diagnosis}</p>
                                        <p className="text-xs text-neutral-400">{new Date(rec.timestamp).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-3/5 overflow-y-auto p-4 space-y-3">
                             {selectedPatientRecords.length > 0 ? selectedPatientRecords.map(rec => (
                                <div key={rec.id} className="bg-neutral-800/80 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg text-rose-300">{rec.diagnosis}</h3>
                                    <p className="text-xs text-neutral-400">By {rec.doctor} on {new Date(rec.timestamp).toLocaleDateString()}</p>
                                    <p className="mt-2"><strong className="text-neutral-300">Treatment:</strong> {rec.treatment}</p>
                                    <p className="mt-1"><strong className="text-neutral-300">Notes:</strong> {rec.notes || 'N/A'}</p>
                                </div>
                             )) : (
                                <div className="h-full flex flex-col items-center justify-center text-neutral-500">
                                    <User size={64} />
                                    <p className="mt-2 font-semibold">Search for a patient to view records.</p>
                                </div>
                             )}
                        </div>
                    </div>
                );
            case 'live-map':
                 return (
                    <div className="h-full bg-neutral-800 relative">
                        <img src="https://i.imgur.com/P4S9HXC.jpeg" alt="Los Santos Map" className="w-full h-full object-cover opacity-40"/>
                        <div className="absolute inset-0">
                             {props.onDutyUnits.map(unit => (
                                <div key={unit.identifier} className="absolute w-3 h-3 bg-rose-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2" style={{ 
                                    left: `${(unit.pos.x + 5000) / 100}%`,
                                    top: `${(10000 - unit.pos.y) / 100}%`
                                }}>
                                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-white bg-black/50 px-1 rounded whitespace-nowrap">{unit.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'dashboard':
            default:
                return (
                    <div className="p-4 text-white">
                        <h2 className="text-2xl font-bold">{t('dashboard')}</h2>
                        <p>Welcome to MediTab. Manage patient records and view active units.</p>
                         <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="bg-neutral-800/50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg">{t('duty_status')}</h3>
                                <p className={`text-xl font-semibold ${props.onDuty ? 'text-green-400' : 'text-red-400'}`}>{props.onDuty ? t('on_duty') : t('off_duty')}</p>
                            </div>
                             <div className="bg-neutral-800/50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg">{t('active_units')}</h3>
                                <p className="text-xl font-semibold text-rose-300">{props.onDutyUnits.length}</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };
    
    const NavItem: React.FC<{ icon: React.ElementType, label: string, target: MediTabPage }> = ({ icon: Icon, label, target }) => (
        <button 
            onClick={() => setPage(target)}
            className={`flex items-center gap-3 w-full text-left p-3 rounded-lg transition-colors ${page === target ? 'bg-rose-500/20 text-rose-300' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
            <Icon size={22} />
            <span className="font-semibold">{label}</span>
        </button>
    );

    return (
        <div className="bg-neutral-900 text-white h-full flex flex-row">
            <aside className="w-64 flex-shrink-0 bg-neutral-800/50 p-3 flex flex-col justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-4 px-2 flex items-center gap-2"><HeartPulse/>{t('meditab_title')}</h1>
                    <nav className="space-y-2">
                        <NavItem icon={LayoutDashboard} label={t('dashboard')} target="dashboard" />
                        <NavItem icon={User} label={t('meditab_patient_records')} target="records" />
                        <NavItem icon={Map} label={t('live_map')} target="live-map" />
                    </nav>
                </div>
                <div>
                     <button 
                        onClick={() => props.onSetDuty(!props.onDuty)}
                        className={`flex items-center justify-center gap-3 w-full text-left p-3 rounded-lg transition-colors font-semibold ${props.onDuty ? 'bg-red-500/80 hover:bg-red-600' : 'bg-green-500/80 hover:bg-green-600'}`}
                    >
                        {props.onDuty ? <><LogOut size={22}/><span>{t('off_duty')}</span></> : <><LogIn size={22}/><span>{t('on_duty')}</span></>}
                    </button>
                </div>
            </aside>
            <main className="flex-grow overflow-y-auto bg-black/20">
                {renderPage()}
                {isCreateModalOpen && <CreateRecordModal />}
            </main>
        </div>
    );
};

export default MediTab;
