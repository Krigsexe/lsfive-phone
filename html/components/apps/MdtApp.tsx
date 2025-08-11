

import React, { useState } from 'react';
import type { OnDutyUnit, MdtCitizen, MdtIncident, MdtReport } from '../../types';
import { LayoutDashboard, Users, FileText, Map, LogOut, LogIn, Search, X, Plus, User as UserIcon, ClipboardList } from 'lucide-react';
import { useLocale } from '../../i18n';

interface MdtAppProps {
    onDuty: boolean;
    onSetDuty: (status: boolean) => void;
    onDutyUnits: OnDutyUnit[];
    onSearchCitizens: (query: string) => Promise<MdtCitizen[]>;
    onCreateIncident: (data: any) => void;
}

type MdtPage = 'dashboard' | 'citizen-search' | 'incidents' | 'live-map';

const MdtApp: React.FC<MdtAppProps> = (props) => {
    const { t } = useLocale();
    const [page, setPage] = useState<MdtPage>('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MdtCitizen[]>([]);
    const [selectedCitizen, setSelectedCitizen] = useState<MdtCitizen | null>(null);
    const [isCreateIncidentModalOpen, setCreateIncidentModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsLoading(true);
        const results = await props.onSearchCitizens(searchQuery);
        setSearchResults(results);
        setIsLoading(false);
    };
    
    const CreateIncidentModal: React.FC<{ citizen?: MdtCitizen }> = ({ citizen }) => {
        // ... Implementation for creating an incident report ...
        return <div />; // Placeholder
    };

    const CitizenProfileView: React.FC<{ citizen: MdtCitizen }> = ({ citizen }) => (
         <div className="p-4 bg-neutral-800/50 rounded-lg">
            <div className="flex items-center gap-4">
                <img src={citizen.image_url} alt={citizen.name} className="w-24 h-24 rounded-lg object-cover bg-neutral-700" />
                <div>
                    <h3 className="text-2xl font-bold">{citizen.name}</h3>
                    <p className="text-neutral-300">DOB: {citizen.dateofbirth} | Gender: {citizen.gender}</p>
                    <p className="text-neutral-300">Phone: {citizen.phone_number}</p>
                </div>
            </div>
            <div className="mt-4">
                <h4 className="font-bold text-lg mb-2">{t('mdt_incidents')}</h4>
                {/* Map over citizen.incidents here */}
                <button onClick={() => setCreateIncidentModalOpen(true)} className="mt-2 w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-lg flex items-center justify-center gap-2">
                    <Plus size={18} /> {t('mdt_create_incident')}
                </button>
            </div>
         </div>
    );

    const renderPage = () => {
        switch (page) {
            case 'citizen-search':
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
                                        placeholder={t('mdt_search_placeholder')}
                                        className="w-full bg-neutral-800 p-2.5 pl-10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                </div>
                            </div>
                            <div className="overflow-y-auto flex-grow">
                                {isLoading && <p className="p-4 text-neutral-400">{t('loading')}...</p>}
                                {!isLoading && searchResults.length === 0 && <p className="p-4 text-neutral-400">{t('mdt_no_results')}</p>}
                                {searchResults.map(citizen => (
                                    <div key={citizen.identifier} onClick={() => setSelectedCitizen(citizen)} className={`flex items-center gap-3 p-3 cursor-pointer border-b border-neutral-800 hover:bg-neutral-700/50 ${selectedCitizen?.identifier === citizen.identifier ? 'bg-blue-500/20' : ''}`}>
                                        <img src={citizen.image_url} alt={citizen.name} className="w-10 h-10 rounded-full bg-neutral-700" />
                                        <div>
                                            <p className="font-semibold text-white">{citizen.name}</p>
                                            <p className="text-sm text-neutral-400">{citizen.identifier}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-3/5 overflow-y-auto p-4">
                             {selectedCitizen ? <CitizenProfileView citizen={selectedCitizen} /> : (
                                <div className="h-full flex flex-col items-center justify-center text-neutral-500">
                                    <Users size={64} />
                                    <p className="mt-2 font-semibold">Select a citizen to view their profile.</p>
                                </div>
                             )}
                        </div>
                    </div>
                );
            case 'incidents':
                return <div className="p-4">{/* TODO: Incidents Page */}</div>;
            case 'live-map':
                return (
                    <div className="h-full bg-neutral-800 relative">
                        <img src="https://i.imgur.com/P4S9HXC.jpeg" alt="Los Santos Map" className="w-full h-full object-cover opacity-40"/>
                        <div className="absolute inset-0">
                            {props.onDutyUnits.map(unit => (
                                <div key={unit.identifier} className="absolute w-3 h-3 bg-blue-400 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2" style={{ 
                                    left: `${(unit.pos.x + 5000) / 100}%`, // Example conversion
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
                return <div className="p-4 text-white">
                    <h2 className="text-2xl font-bold">{t('dashboard')}</h2>
                    <p>Welcome to the MDT. Use the sidebar to navigate.</p>
                    <div className="mt-4 bg-neutral-800/50 p-4 rounded-lg">
                        <h3 className="font-bold">{t('duty_status')}</h3>
                        <p className={props.onDuty ? 'text-green-400' : 'text-red-400'}>{props.onDuty ? t('on_duty') : t('off_duty')}</p>
                    </div>
                </div>;
        }
    }

    const NavItem: React.FC<{ icon: React.ElementType, label: string, target: MdtPage }> = ({ icon: Icon, label, target }) => (
        <button 
            onClick={() => setPage(target)}
            className={`flex items-center gap-3 w-full text-left p-3 rounded-lg transition-colors ${page === target ? 'bg-blue-500/20 text-blue-300' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
            <Icon size={22} />
            <span className="font-semibold">{label}</span>
        </button>
    );

    return (
        <div className="bg-neutral-900 text-white h-full flex flex-row">
            <aside className="w-64 flex-shrink-0 bg-neutral-800/50 p-3 flex flex-col justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-4 px-2 flex items-center gap-2"><ClipboardList/>{t('mdt_title')}</h1>
                    <nav className="space-y-2">
                        <NavItem icon={LayoutDashboard} label={t('dashboard')} target="dashboard" />
                        <NavItem icon={Users} label={t('mdt_citizen_search')} target="citizen-search" />
                        <NavItem icon={FileText} label={t('mdt_incident_reports')} target="incidents" />
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
            </main>
        </div>
    );
};

export default MdtApp;
