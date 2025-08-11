
import React from 'react';

const BootScreen: React.FC = () => {
    return (
        <div className="w-[420px] h-[900px] bg-black rounded-[40px] shadow-2xl shadow-black/80 border-4 border-neutral-800 flex flex-col items-center justify-center relative p-2">
            <div className="relative w-full h-full bg-black rounded-[34px] flex flex-col items-center justify-center overflow-hidden">
                <img 
                    src="https://i.ibb.co/7dgR0Cj3/Neon-Purple-V-Sign-Against-Dark-Brick-Wall-Photoroom.png" 
                    alt="Boot Logo"
                    className="w-1/2 h-auto animate-fade-in-out" 
                />
            </div>
            <style>
                {`
                    @keyframes fade-in-out {
                        0% {
                            opacity: 0;
                        }
                        20%, 80% {
                            opacity: 1;
                        }
                        100% {
                            opacity: 0;
                        }
                    }
                    .animate-fade-in-out {
                        animation: fade-in-out 2.5s ease-in-out forwards;
                    }
                `}
            </style>
        </div>
    );
};

export default BootScreen;
