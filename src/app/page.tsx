'use client';
import { useAuth } from '../../AuthContext';
import { AuthGuard } from '../../AuthGuard';
import { BottomNav } from '../../BottomNav';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCompanies, Company } from '../db/company-data';
import { LogOut, Building2, Scan, Package, Plus } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    if (currentUser?.companyId) {
      const company = getCompanies().find(c => c.id === currentUser.companyId);
      if (company) {
        setCompanyName(company.name);
      }
    }
  }, [currentUser]);

  // Si es Super Admin, redirigir al panel de administración automáticamente
  useEffect(() => {
    if (currentUser?.role === 'admin' && !currentUser.companyId) {
        router.push('/super-admin');
    }
  }, [currentUser, router]);

  // Evitar renderizar el contenido de empleado si se está redirigiendo
  if (currentUser?.role === 'admin' && !currentUser.companyId) return null;

  const handleLogout = () => {
    logout();
    router.push('/platform-admin');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 pb-24">
        <header className="bg-white p-4 shadow-sm flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Hola, {currentUser?.name}</h1>
            <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
              <Building2 size={14} />
              <span className="font-medium">{companyName || 'Cargando empresa...'}</span>
            </div>
            <p className="text-xs text-slate-400 capitalize mt-0.5">{currentUser?.role === 'admin' ? 'Administrador' : currentUser?.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </header>
        
        <main className="p-4">
            <div className="grid gap-4">
                <Link href="/scan" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                    <div className="p-4 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                        <Scan size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-slate-800">Escanear Rollo</h3>
                        <p className="text-slate-500 text-sm">Cámara Activa</p>
                    </div>
                </Link>

                <Link href="/inventory" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                    <div className="p-4 bg-purple-100 text-purple-600 rounded-full group-hover:scale-110 transition-transform">
                        <Package size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-slate-800">Ver Stock</h3>
                        <p className="text-slate-500 text-sm">Consultar inventario global</p>
                    </div>
                </Link>

                {currentUser?.role === 'admin' && (
                    <Link href="/products/new" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                        <div className="p-4 bg-green-100 text-green-600 rounded-full group-hover:scale-110 transition-transform">
                            <Plus size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800">Nuevo Producto</h3>
                            <p className="text-slate-500 text-sm">Crear artículo para una empresa</p>
                        </div>
                    </Link>
                )}
            </div>
        </main>

        <BottomNav />
      </div>
    </AuthGuard>
  );
}