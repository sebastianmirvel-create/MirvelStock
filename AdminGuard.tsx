'use client';

import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Lock } from 'lucide-react';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentUser?.role !== 'admin') {
      router.push('/'); // Redirect to home if not admin
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || currentUser?.role !== 'admin') {
    return <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-slate-500 p-8"><Lock size={48} /><h2 className="text-xl font-bold">Acceso Denegado</h2><p className="text-center">Necesitas permisos de administrador para ver esta sección.</p></div>;
  }

  return <>{children}</>;
};