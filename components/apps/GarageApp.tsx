

import React from 'react';
import type { Vehicle } from '../../types';
import { VehicleStatus } from '../../types';
import { Car, ShieldAlert, CheckCircle, Ban, KeyRound } from 'lucide-react';
import { useLocale } from '../../i18n';

interface GarageAppProps {
    vehicles: Vehicle[];
    onRequestVehicle: (vehicleId: string) => void;
}

const GarageApp: React.FC<GarageAppProps> = ({ vehicles, onRequestVehicle }) => {
    const { t } = useLocale();

    const StatusIndicator: React.FC<{ status: VehicleStatus }> = ({ status }) => {
        switch (status) {
            case VehicleStatus.GARAGED:
                return <div className="flex items-center gap-1.5 text-xs text-green-400"><CheckCircle size={14} /><span>{t('garaged')}</span></div>;
            case VehicleStatus.IMPOUNDED:
                return <div className="flex items-center gap-1.5 text-xs text-red-400"><ShieldAlert size={14} /><span>{t('impounded')}</span></div>;
            case VehicleStatus.OUT:
                return <div className="flex items-center gap-1.5 text-xs text-blue-400"><Ban size={14} /><span>{t('out')}</span></div>;
            default:
                return null;
        }
    };

    return (
        <div className="bg-transparent text-white h-full flex flex-col">
            <header className="p-4 sticky top-0 bg-black/30 backdrop-blur-xl border-b border-neutral-800">
                <h1 className="text-3xl font-bold text-white">{t('garage_title')}</h1>
            </header>
            <div className="flex-grow overflow-y-auto p-3 space-y-3">
                {vehicles.length > 0 ? vehicles.map(vehicle => (
                    <div key={vehicle.id} className="bg-neutral-900/80 rounded-2xl overflow-hidden shadow-lg border border-neutral-800">
                        <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${vehicle.imageUrl || `https://via.placeholder.com/400x200?text=${vehicle.name}`})` }}></div>
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold">{vehicle.name}</h2>
                                    <p className="text-sm text-neutral-400 font-mono bg-neutral-800 px-2 py-0.5 rounded-md inline-block mt-1">{vehicle.plate}</p>
                                </div>
                                <StatusIndicator status={vehicle.status} />
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={() => onRequestVehicle(vehicle.id)}
                                    disabled={vehicle.status !== VehicleStatus.GARAGED}
                                    className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-2.5 rounded-lg transition-colors hover:bg-orange-600 disabled:bg-neutral-600 disabled:text-neutral-400 disabled:cursor-not-allowed"
                                >
                                    <KeyRound size={18} />
                                    {t('request_vehicle')}
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                     <div className="text-center text-neutral-500 flex flex-col items-center justify-center h-full -mt-16">
                        <Car size={64} className="mx-auto mb-4" />
                        <p className="text-lg font-semibold">{t('no_vehicles')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GarageApp;