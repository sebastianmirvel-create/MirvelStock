'use client';
import { useState, useEffect } from 'react';
import { Scan, Camera, Box, X, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useZxing } from 'react-zxing';

export const Scanner = ({ onScan }: { onScan?: (result: string) => void }) => {
    const [useCamera, setUseCamera] = useState(true);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [key, setKey] = useState(0); // Para reiniciar la cámara si se traba

    const { ref } = useZxing({
        onDecodeResult(result) {
            if (!scanResult) {
                const text = result.getText();
                setScanResult(text);
                
                // Feedback: Vibración (si el dispositivo lo soporta)
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(200);
                }

                toast.success(`¡Escaneado! ${text}`);
                if (onScan) onScan(text);
                
                // Pausa breve antes de permitir otro escaneo para evitar lecturas dobles
                setTimeout(() => {
                    setScanResult(null);
                }, 3000);
            }
        },
        paused: !useCamera || !!scanResult,
        constraints: { video: { facingMode: 'environment' } } // Priorizar cámara trasera
    });

    // Simulación de escaneo
    const handleManualScan = (mockCode: string) => {
        setScanResult(mockCode);
        
        // Feedback visual
        toast.success(`Código detectado: ${mockCode}`);
        
        if (onScan) onScan(mockCode);
        
        // Reiniciar escaneo después de un momento para permitir otro
        setTimeout(() => {
            setScanResult(null);
        }, 3000);
    };

    return (
        <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Área de Cámara / Simulación */}
            <div className="relative w-full aspect-square bg-slate-900 overflow-hidden">
                {useCamera ? (
                    <video 
                        ref={ref} 
                        key={key}
                        className="w-full h-full object-cover" 
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                        <Scan size={64} className="text-slate-600 animate-pulse" />
                        <p className="absolute bottom-10 text-slate-400 text-sm">Modo Simulación</p>
                    </div>
                )}

                {/* Overlay Gráfico (Mira) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-32 border-2 border-blue-500/50 rounded-lg relative flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500/80 absolute top-1/2 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                    </div>
                </div>

                {/* Resultado Flotante */}
                {scanResult && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                        <div className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-black text-xl shadow-2xl animate-in zoom-in duration-200">
                            {scanResult}
                        </div>
                    </div>
                )}
            </div>

            {/* Controles */}
            <div className="bg-slate-900 p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center text-white/50 text-xs uppercase font-bold tracking-wider mb-1">
                    <span>Opciones de Escaneo</span>
                    <button onClick={() => setKey(k => k + 1)} className="flex items-center gap-1 hover:text-white"><RefreshCcw size={12}/> Reiniciar Cámara</button>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2">
                <button 
                    onClick={() => handleManualScan("ROLLO-001")}
                    className="bg-white text-blue-700 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-transform whitespace-nowrap"
                >
                    <Box size={16} /> Probar Existente
                </button>
                <button 
                    onClick={() => handleManualScan("NUEVO-" + Math.floor(Math.random() * 1000))}
                    className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-transform whitespace-nowrap"
                >
                    <Camera size={16} /> Probar Nuevo
                </button>

                <button 
                    onClick={() => setUseCamera(!useCamera)}
                    className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-transform whitespace-nowrap ${useCamera ? 'bg-red-500/20 text-red-200 border border-red-500/50' : 'bg-green-500/20 text-green-200 border border-green-500/50'}`}
                >
                    {useCamera ? <X size={16} /> : <Camera size={16} />} 
                    {useCamera ? 'Apagar Cámara' : 'Usar Cámara'}
                </button>
                </div>
            </div>
        </div>
    );
};