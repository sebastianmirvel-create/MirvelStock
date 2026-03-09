'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';

export const AdminPinModal = () => {
  const { isPinModalOpen, closePinModal, attemptAdminLogin } = useAuth();
  const [pin, setPin] = useState('');

  if (!isPinModalOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (attemptAdminLogin(pin)) {
      toast.success('Acceso de Administrador concedido');
      setPin('');
    } else {
      toast.error('PIN incorrecto');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
            <div className="p-3 bg-slate-100 rounded-full">
                <KeyRound size={32} className="text-slate-600" />
            </div>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso de Administrador</h2>
        <p className="text-slate-500 mb-6 text-sm">Ingresa el PIN para continuar.</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full p-4 text-center text-2xl font-bold tracking-[8px] bg-slate-100 border-2 border-slate-200 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={4}
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={closePinModal} className="w-full bg-slate-200 text-slate-800 font-bold py-3 rounded-lg active:scale-95 transition-transform">Cancelar</button>
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg active:scale-95 transition-transform">Desbloquear</button>
          </div>
        </form>
      </div>
    </div>
  );
};