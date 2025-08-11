
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCcw, User, VideoOff, AlertTriangle } from 'lucide-react';

type CameraError = 'permission-denied' | 'not-found' | 'generic' | null;

const createMockStream = (): MediaStream | null => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw SMPTE color bars
    const colors = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
    const barWidth = canvas.width / colors.length;
    colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(i * barWidth, 0, barWidth, canvas.height * 0.75);
    });
    
    ctx.fillStyle = '#1c1c1e';
    ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.25);
    
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('NO CAMERA DETECTED', canvas.width / 2, canvas.height * 0.88);

    const stream = canvas.captureStream(30); // 30 fps

    // Add a silent audio track to make it a full MediaStream
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const dst = audioContext.createMediaStreamDestination();
    oscillator.connect(dst);
    oscillator.start();
    const audioTrack = dst.stream.getAudioTracks()[0];
    if (audioTrack) {
        stream.addTrack(audioTrack);
    }
    
    return stream;
}

const CameraApp: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [cameraError, setCameraError] = useState<CameraError>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getCameraStream = useCallback(async () => {
        setIsLoading(true);
        setCameraError(null);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("getUserMedia not supported, creating mock stream.");
            const mockStream = createMockStream();
            if (mockStream) {
                streamRef.current = mockStream;
                if (videoRef.current) videoRef.current.srcObject = mockStream;
            } else {
                setCameraError('generic');
            }
            setIsLoading(false);
            return;
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = mediaStream;
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (err) {
            console.error("Error accessing camera:", err);
            if (err instanceof DOMException) {
                if (err.name === 'NotFoundError') {
                    console.warn("Camera not found, creating mock stream.");
                    const mockStream = createMockStream();
                    if (mockStream) {
                        streamRef.current = mockStream;
                        if (videoRef.current) videoRef.current.srcObject = mockStream;
                    } else {
                        setCameraError('generic');
                    }
                } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setCameraError('permission-denied');
                } else {
                    setCameraError('generic');
                }
            } else {
                setCameraError('generic');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getCameraStream();
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [getCameraStream]);

    const ErrorDisplay: React.FC<{ type: CameraError; onRetry: () => void }> = ({ type, onRetry }) => {
        let title = "Could Not Start Camera";
        let message = "An unexpected error occurred. Please try again.";
        let Icon = AlertTriangle;

        switch (type) {
            case 'permission-denied':
                title = "Camera Access Denied";
                message = "Please enable camera permissions in your browser or system settings to use this app.";
                Icon = Camera;
                break;
        }
        return (
            <div className="text-center text-white p-4">
                <Icon size={48} className="mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">{message}</p>
                <button 
                    onClick={onRetry} 
                    className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full transition-colors flex items-center gap-2 mx-auto"
                >
                    <RefreshCcw size={16} />
                    Try Again
                </button>
            </div>
        );
    };

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-white animate-pulse">Starting Camera...</p>;
        }
        if (cameraError) {
            return <ErrorDisplay type={cameraError} onRetry={getCameraStream} />;
        }
        return <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>;
    };

    return (
        <div className="h-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
            {renderContent()}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-xl flex justify-between items-center z-10">
                <div className="w-10 h-10 bg-neutral-500/30 backdrop-blur-md rounded-lg flex items-center justify-center">
                    <User size={20} className="text-white" />
                </div>
                <button className="w-16 h-16 rounded-full border-4 border-white bg-transparent flex items-center justify-center active:scale-95 transition-transform">
                    <div className="w-14 h-14 rounded-full bg-white"></div>
                </button>
                 <button className="w-10 h-10 bg-neutral-500/30 backdrop-blur-md rounded-full flex items-center justify-center">
                    <RefreshCcw size={18} className="text-white" />
                </button>
            </div>
        </div>
    );
};

export default CameraApp;
