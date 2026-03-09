'use client';

import { useAuth } from './AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isLoginPage = pathname.endsWith('/login') || pathname === '/platform-admin';

    if (!isLoading) {
        // Si ya estoy logueado y voy a una página de login, me redirige a la home.
        if (currentUser && isLoginPage) {
            // Si es Super Admin (admin sin companyId), va al panel de super admin
            if (currentUser.role === 'admin' && !currentUser.companyId) {
                router.push('/super-admin');
            } else {
                router.push('/');
            }
        } else if (!currentUser && !isLoginPage) {
            // Si NO estoy logueado y estoy en una ruta protegida, ir al login general
            router.push('/platform-admin');
        }
    }
  }, [currentUser, isLoading, pathname, router]);

  const isLoginPage = pathname.endsWith('/login') || pathname === '/platform-admin';
  if (isLoading || (!currentUser && !isLoginPage)) {
    return <div className="flex items-center justify-center h-screen"><p>Cargando...</p></div>;
  }

  return <>{children}</>;
};