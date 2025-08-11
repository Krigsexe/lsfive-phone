
import React, { useState } from 'react';
import type { Business } from '../../types';
import { Building2, MapPin, ChevronLeft } from 'lucide-react';
import { useLocale } from '../../i18n';

interface BusinessAppProps {
    businesses: Business[];
    onSetGPS: (location: Business['location']) => void;
}

const BusinessApp: React.FC<BusinessAppProps> = ({ businesses, onSetGPS }) => {
    const { t } = useLocale();
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

    const handleSetGps = (location: Business['location']) => {
        onSetGPS(location);
        alert('GPS set to ' + selectedBusiness?.name);
    };

    const BusinessListView = () => (
        <div className="bg-transparent text-white h-full flex flex-col">
            <header className="p-4 sticky top-0 bg-black/30 backdrop-blur-xl border-b border-neutral-800">
                <h1 className="text-3xl font-bold text-white">{t('businesses_title')}</h1>
            </header>
            <div className="flex-grow overflow-y-auto p-3 space-y-2">
                {businesses.length > 0 ? businesses.map(biz => (
                    <div key={biz.id} onClick={() => setSelectedBusiness(biz)} className="flex items-center gap-3 p-3 bg-neutral-900/80 hover:bg-neutral-800/80 rounded-xl cursor-pointer transition-colors">
                        <img src={biz.logoUrl || `https://ui-avatars.com/api/?name=${biz.name.replace(/\s/g, '+')}&background=random`} alt={biz.name} className="w-11 h-11 rounded-lg bg-neutral-700 flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="font-bold text-white text-base">{biz.name}</p>
                            <p className="text-sm text-cyan-400">{biz.type}</p>
                        </div>
                    </div>
                )) : (
                     <div className="text-center text-neutral-500 flex flex-col items-center justify-center h-full -mt-16">
                        <Building2 size={56} className="mx-auto mb-4" />
                        <p className="text-base font-semibold">{t('no_businesses')}</p>
                    </div>
                )}
            </div>
        </div>
    );
    
    const BusinessDetailView = () => {
        if (!selectedBusiness) return null;
        return (
             <div className="bg-transparent text-white h-full flex flex-col">
                 <header className="p-2 bg-black/30 backdrop-blur-xl flex items-center gap-2 sticky top-0 border-b border-neutral-800 z-10">
                    <button onClick={() => setSelectedBusiness(null)} className="text-white p-2 rounded-full hover:bg-neutral-700">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-white truncate">{selectedBusiness.name}</h1>
                </header>
                <div className="flex-grow overflow-y-auto p-3 space-y-3">
                    <div className="flex items-center gap-3">
                        <img src={selectedBusiness.logoUrl || `https://ui-avatars.com/api/?name=${selectedBusiness.name.replace(/\s/g, '+')}&background=random`} alt={selectedBusiness.name} className="w-16 h-16 rounded-xl bg-neutral-700" />
                        <div>
                            <h2 className="text-xl font-bold">{selectedBusiness.name}</h2>
                            <p className="text-cyan-400 text-sm">{selectedBusiness.type}</p>
                            <p className="text-xs text-neutral-400">{t('owner')}: {selectedBusiness.owner}</p>
                        </div>
                    </div>
                    <p className="text-neutral-300 bg-neutral-900/80 p-3 rounded-lg text-sm">{selectedBusiness.description}</p>
                    <button
                        onClick={() => handleSetGps(selectedBusiness.location)}
                        className="w-full flex items-center justify-center gap-2 bg-cyan-500 text-white font-bold py-2.5 rounded-lg transition-colors hover:bg-cyan-600"
                    >
                        <MapPin size={16} />
                        {t('set_gps')}
                    </button>
                </div>
            </div>
        )
    }

    return selectedBusiness ? <BusinessDetailView /> : <BusinessListView />;
};

export default BusinessApp;
