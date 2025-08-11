
import React, { useState, useMemo } from 'react';
import type { OnDutyUnit, MechanicInvoice, Vehicle } from '../../types';
import { LayoutDashboard, Car, FileText, Map, LogOut, LogIn, Wrench, Search, Plus, X, Trash2 } from 'lucide-react';
import { useLocale } from '../../i18n';

interface MechaTabProps {
    onDuty: boolean;
    onSetDuty: (status: boolean) => void;
    onDutyUnits: OnDutyUnit[];
    onSearchVehicle: (plate: string) => Promise<(Vehicle & { owner: string }) | null>;
    onCreateInvoice: (data: any) => void;
    invoices: MechanicInvoice[];
}

type MechaTabPage = 'dashboard' | 'vehicle-lookup' | 'invoices' | 'live-map';

const MechaTab: React.FC<MechaTabProps> = (props) => {
    const { t } = useLocale();
    const [page, setPage] = useState<MechaTabPage>('dashboard');
    const [isCreateInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false);
    
    // Vehicle Lookup State
    const [searchPlate, setSearchPlate] = useState('');
    const [vehicleInfo, setVehicleInfo] = useState<(Vehicle & { owner: string }) | null>(null);
    const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);

    const handleVehicleSearch = async () => {
        if (!searchPlate) return;
        setIsLoadingVehicle(true);
        const result = await props.onSearchVehicle(searchPlate);
        setVehicleInfo(result);
        setIsLoadingVehicle(false);
    };

    const CreateInvoiceModal: React.FC = () => {
        const [customerName, setCustomerName] = useState('');
        const [plate, setPlate] = useState('');
        const [services, setServices] = useState<{name: string, price: number}[]>([]);
        const [serviceName, setServiceName] = useState('');
        const [servicePrice, setServicePrice] = useState('');

        const handleAddService = () => {
            if (serviceName && servicePrice) {
                setServices([...services, { name: serviceName, price: parseFloat(servicePrice) }]);
                setServiceName('');
                setServicePrice('');
            }
        };
        
        const total = useMemo(() => services.reduce((sum, s) => sum + s.price, 0), [services]);

        const handleSubmit = () => {
            if (customerName && plate && services.length > 0) {
                props.onCreateInvoice({
                    customer_name: customerName,
                    vehicle_plate: plate,
                    services: JSON.stringify(services),
                    total: total
                });
                setCreateInvoiceModalOpen(false);
            }
        }

        return (
             <div className="absolute inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4">
                <div className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg relative text-white">
                     <button onClick={() => setCreateInvoiceModalOpen(false)} className="absolute top-2 right-2 p-2 text-neutral-400 hover:text-white"><X size={24}/></button>
                     <h2 className="text-xl font-bold mb-4">{t('mechatab_create_invoice')}</h2>
                     <div className="space-y-3">
                        <input value={customerName} onChange={e => setCustomerName(e.target.value)} type="text" placeholder={t('mechatab_customer_name')} className="w-full bg-neutral-700 p-2 rounded-lg" required />
                        <input value={plate} onChange={e => setPlate(e.target.value)} type="text" placeholder={t('plate')} className="w-full bg-neutral-700 p-2 rounded-lg" required />
                        
                        <div className="border-t border-b border-neutral-700 py-3 my-2">
                             <h3 className="font-semibold mb-2">Services</h3>
                             <div className="flex gap-2">
                                <input value={serviceName} onChange={e => setServiceName(e.target.value)} type="text" placeholder={t('mechatab_service_description')} className="flex-grow bg-neutral-700 p-2 rounded-lg" />
                                <input value={servicePrice} onChange={e => setServicePrice(e.target.value)} type="number" placeholder={t('mechatab_service_cost')} className="w-28 bg-neutral-700 p-2 rounded-lg" />
                                <button onClick={handleAddService} type="button" className="bg-amber-500 p-2 rounded-lg"><Plus size={20}/></button>
                             </div>
                             <ul className="mt-2 space-y-1 max-h-28 overflow-y-auto">
                                {services.map((s, i) => <li key={i} className="flex justify-between items-center bg-neutral-700/50 p-1.5 rounded-md"><span>{s.name}</span><span>${s.price.toFixed(2)}</span></li>)}
                             </ul>
                        </div>

                        <div className="text-right font-bold text-xl">
                            {t('mechatab_total')}: ${total.toFixed(2)}
                        </div>

                        <button onClick={handleSubmit} type="submit" className="w-full bg-amber-600 hover:bg-amber-700 font-bold py-2 rounded-lg">{t('mechatab_submit_invoice')}</button>
                     </div>
                </div>
            </div>
        )
    };

    const renderPage = () => {
        switch (page) {
            case 'vehicle-lookup':
                return (
                    <div className="p-4 space-y-4">
                         <div className="relative">
                             <input 
                                type="text"
                                value={searchPlate}
                                onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleVehicleSearch()}
                                placeholder={t('mechatab_search_placeholder')}
                                className="w-full bg-neutral-800 p-3 pl-10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        </div>
                        {isLoadingVehicle && <p>Loading...</p>}
                        {vehicleInfo ? (
                             <div className="bg-neutral-800/80 p-4 rounded-lg">
                                 <h3 className="font-bold text-lg text-amber-300">{t('mechatab_vehicle_info')}</h3>
                                 <p><strong className="text-neutral-300">{t('plate')}:</strong> {vehicleInfo.plate}</p>
                                 <p><strong className="text-neutral-300">Model:</strong> {vehicleInfo.name}</p>
                                 <p><strong className="text-neutral-300">{t('mechatab_owner')}:</strong> {vehicleInfo.owner}</p>
                             </div>
                        ) : (
                            !isLoadingVehicle && searchPlate && <p>{t('mechatab_no_vehicle_info')}</p>
                        )}
                    </div>
                );
            case 'invoices':
                return (
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{t('mechatab_invoices')}</h2>
                             <button onClick={() => setCreateInvoiceModalOpen(true)} className="bg-amber-500 hover:bg-amber-600 p-2 rounded-lg flex items-center gap-2">
                                <Plus size={18} /> {t('mechatab_create_invoice')}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {props.invoices.map(inv => (
                                <div key={inv.id} className="bg-neutral-800/80 p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-white">Invoice #{inv.id} - {inv.customer_name}</p>
                                            <p className="text-sm text-neutral-300">{inv.vehicle_plate}</p>
                                        </div>
                                        <p className="font-semibold text-amber-300 text-lg">${inv.total.toFixed(2)}</p>
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-1">{new Date(inv.timestamp).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'live-map':
                return (
                    <div className="h-full bg-neutral-800 relative">
                        <img src="https://i.imgur.com/P4S9HXC.jpeg" alt="Los Santos Map" className="w-full h-full object-cover opacity-40"/>
                        <div className="absolute inset-0">
                             {props.onDutyUnits.map(unit => (
                                <div key={unit.identifier} className="absolute w-3 h-3 bg-amber-400 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2" style={{ 
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
                return <div className="p-4 text-white">
                    <h2 className="text-2xl font-bold">Dashboard</h2>
                    <p>Welcome to MechaTab. Manage invoices and view active units.</p>
                </div>;
        }
    };

    const NavItem: React.FC<{ icon: React.ElementType, label: string, target: MechaTabPage }> = ({ icon: Icon, label, target }) => (
        <button 
            onClick={() => setPage(target)}
            className={`flex items-center gap-3 w-full text-left p-3 rounded-lg transition-colors ${page === target ? 'bg-amber-500/20 text-amber-300' : 'text-neutral-300 hover:bg-neutral-700'}`}
        >
            <Icon size={22} />
            <span className="font-semibold">{label}</span>
        </button>
    );

    return (
        <div className="bg-neutral-900 text-white h-full flex flex-row">
            <aside className="w-64 flex-shrink-0 bg-neutral-800/50 p-3 flex flex-col justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-4 px-2 flex items-center gap-2"><Wrench/>{t('mechatab_title')}</h1>
                    <nav className="space-y-2">
                        <NavItem icon={LayoutDashboard} label={t('dashboard')} target="dashboard" />
                        <NavItem icon={Car} label={t('mechatab_vehicle_lookup')} target="vehicle-lookup" />
                        <NavItem icon={FileText} label={t('mechatab_invoices')} target="invoices" />
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
                {isCreateInvoiceModalOpen && <CreateInvoiceModal/>}
            </main>
        </div>
    );
};

export default MechaTab;
