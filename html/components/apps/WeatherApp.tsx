
import React, { useState, useEffect } from 'react';
import type { WeatherInfo, WeatherDay } from '../../types';
import { LoaderCircle, AlertTriangle } from 'lucide-react';
import { getWeatherIcon } from '../../components/ClockWidget';

interface WeatherAppProps {
    locale: 'en' | 'fr';
}

const WeatherApp: React.FC<WeatherAppProps> = ({ locale }) => {
    const [weather, setWeather] = useState<WeatherInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const location = locale === 'fr' ? 'Paris' : 'Los+Angeles';

    useEffect(() => {
        const fetchWeather = async () => {
            if (!locale) return;
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://wttr.in/${location}?format=j1&lang=${locale}`);
                if (!response.ok) throw new Error('Failed to fetch weather data.');
                const data = await response.json();
                setWeather(data);
            } catch (err) {
                setError('Could not load weather data.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWeather();
    }, [location, locale]);

    const temp = (val: string) => `${val}°`;
    const tempUnit = locale === 'fr' ? 'temp_C' : 'temp_F';

    if (isLoading) {
        return <div className="h-full bg-sky-800 flex items-center justify-center text-white"><LoaderCircle size={40} className="animate-spin" /></div>;
    }

    if (error || !weather) {
        return <div className="h-full bg-neutral-800 flex flex-col items-center justify-center text-white p-4 text-center"><AlertTriangle size={40} className="mb-2 text-red-400" />{error || 'Weather data unavailable.'}</div>;
    }

    const current = weather.current_condition[0];
    const todayForecast = weather.weather[0];

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-sky-800 to-sky-600 text-white" style={{ textShadow: '0 1px 3px rgb(0 0 0 / 0.3)' }}>
            <div className="max-w-2xl mx-auto">
                <div className="pt-20 pb-8 text-center">
                    <h1 className="text-4xl font-bold">{location.replace('+', ' ')}</h1>
                    <p className="text-9xl font-thin my-1">{temp(current[tempUnit])}</p>
                    <p className="font-semibold text-2xl capitalize">{current.weatherDesc[0].value}</p>
                    <p className="text-xl">H: {temp(todayForecast[`maxtemp_${tempUnit.slice(-1)}`])} L: {temp(todayForecast[`mintemp_${tempUnit.slice(-1)}`])}</p>
                </div>
                
                <div className="bg-black/10 backdrop-blur-lg rounded-t-2xl p-4 space-y-4">
                    {/* Hourly Forecast */}
                    <div className="bg-black/10 rounded-xl p-3">
                        <h2 className="font-semibold mb-2 px-1">HOURLY FORECAST</h2>
                        <div className="flex overflow-x-auto gap-4 pb-2">
                            {todayForecast.hourly.map((hour, index) => (
                                <div key={index} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16">
                                    <p className="text-sm font-medium">{parseInt(hour.time || '0') / 100}:00</p>
                                    {getWeatherIcon(hour.weatherCode, 36)}
                                    <p className="text-xl font-semibold">{temp(hour[tempUnit])}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5-Day Forecast */}
                    <div className="bg-black/10 rounded-xl p-3">
                         <h2 className="font-semibold mb-1 px-1">5-DAY FORECAST</h2>
                         <ul className="space-y-2">
                            {weather.weather.map((day, index) => (
                                <li key={index} className="flex items-center justify-between gap-4">
                                    <p className="font-semibold w-20">{new Date(day.date).toLocaleDateString(locale, { weekday: 'long' })}</p>
                                    <div className="w-8">
                                        {getWeatherIcon(day.hourly[4].weatherCode, 28)}
                                    </div>
                                    <p className="text-neutral-300">{temp(day[`mintemp_${tempUnit.slice(-1)}`])}</p>
                                    <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-yellow-400 rounded-full"></div>
                                    <p>{temp(day[`maxtemp_${tempUnit.slice(-1)}`])}</p>
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherApp;