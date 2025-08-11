
import React, { useState, useEffect } from 'react';
import type { WeatherInfo, WeatherDataPoint } from '../../types';
import { Sun, Cloudy, CloudRain, Snowflake, Zap, CloudDrizzle, CloudFog, LoaderCircle, AlertTriangle } from 'lucide-react';
import { useLocale } from '../../i18n';

interface ClockWidgetProps {
    locale: 'en' | 'fr';
}

export const getWeatherIcon = (codeStr: string, size: number = 24): JSX.Element => {
    const code = parseInt(codeStr, 10);
    const props = { size, strokeWidth: 1.5 };
    if (isNaN(code)) return <Sun {...props} className="text-yellow-300" />;
    if (code >= 386) return <Zap {...props} className="text-yellow-300" />; // Thunder
    if (code === 350) return <Snowflake {...props} className="text-cyan-200" />; // Ice pellets
    if ((code >= 317 && code <= 338) || (code >= 368 && code <= 377)) return <Snowflake {...props} className="text-white" />; // Snow
    if ((code >= 281 && code <= 314) || (code >= 353 && code <= 359)) return <CloudRain {...props} className="text-blue-300" />; // Rain
    if (code >= 263 && code <= 266) return <CloudDrizzle {...props} className="text-blue-200" />; // Drizzle
    if (code >= 179 && code <= 248) return <CloudFog {...props} className="text-slate-400" />; // Fog
    if (code >= 116 && code <= 143) return <Cloudy {...props} className="text-slate-300" />; // Cloudy
    if (code === 113) return <Sun {...props} className="text-yellow-300" />; // Sunny
    return <Sun {...props} className="text-yellow-300" />; // Default
};

const ClockWidget: React.FC<ClockWidgetProps> = ({ locale }) => {
    const [date, setDate] = useState(new Date());
    const [weather, setWeather] = useState<WeatherInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { timeZone, location } = locale === 'fr' 
        ? { timeZone: 'Europe/Paris', location: 'Paris' }
        : { timeZone: 'America/Los_Angeles', location: 'Los+Angeles' };

    useEffect(() => {
        const fetchWeather = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://wttr.in/${location}?format=j1&lang=${locale}`);
                if (!response.ok) throw new Error('Failed to fetch weather data.');
                const data = await response.json();
                setWeather(data);
            } catch (err) {
                setError('Could not load weather.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchWeather();
    }, [location, locale]);

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000 * 60);
        return () => clearInterval(timer);
    }, []);

    const day = date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone });
    const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone });
    
    const condition: WeatherDataPoint | undefined = weather?.current_condition[0];

    const renderWeather = () => {
        if (isLoading) return <LoaderCircle size={24} className="animate-spin text-neutral-400" />;
        if (error || !condition) {
            return (
                <div className="flex items-center" title={error || "No weather data"}>
                    <AlertTriangle size={24} className="text-red-400" />
                </div>
            );
        }
        
        return (
             <div className="flex gap-2 items-center">
                {getWeatherIcon(condition.weatherCode, 28)}
                <div className="text-left">
                    <p className="font-semibold text-xl">{locale === 'fr' ? `${condition.temp_C}°C` : `${condition.temp_F}°F`}</p>
                    <p className="text-sm text-neutral-300 -mt-1 capitalize">{condition.weatherDesc[0].value}</p>
                </div>
            </div>
        );
    };

    return (
        <div 
            className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white shadow-lg flex flex-col gap-2 w-full"
            style={{textShadow: '0 1px 3px rgb(0 0 0 / 0.5)'}}
        >
             <div className="flex justify-between items-start">
                 <div>
                    <p className="text-5xl font-bold">{time}</p>
                    <p className="text-base font-medium capitalize text-neutral-200">{day}</p>
                 </div>
                 {renderWeather()}
            </div>
        </div>
    );
};

export default ClockWidget;