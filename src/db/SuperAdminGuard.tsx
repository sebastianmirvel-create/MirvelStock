'use client';

import { useAuth } from '../../AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Lock } from 'lucide-react';

export const SuperAdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirige si no está cargando y el usuario NO es un super admin (companyId no es null)
    if (!isLoading && currentUser?.companyId !== null) {
      router.push('/'); 
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || currentUser?.companyId !== null) {
    return <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-slate-500 p-8"><Lock size={48} /><h2 className="text-xl font-bold">Acceso Exclusivo</h2><p className="text-center">Esta sección es solo para el Super Administrador de la plataforma.</p></div>;
  }

  return <>{children}</>;
};