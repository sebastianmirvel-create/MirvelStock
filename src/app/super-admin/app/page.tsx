'use client';
import Link from 'next/link';
import { SuperAdminGuard } from '../../../db/SuperAdminGuard';
import { ArrowLeft, Scan, Package, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../../../../AuthContext';
import { useRouter } from 'next/navigation';

export default function SuperAdminAppPage() {
    const { currentUser, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/platform-admin');
    };

    return (
        <SuperAdminGuard>
            <div className="p-6 min-h-screen bg-slate-50">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Bienvenido, {currentUser?.name}</h1>
                        <p className="text-slate-500 capitalize">Rol: {currentUser?.role}</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="text-red-500 hover:text-red-700 flex items-center gap-2 text-sm font-bold"
                    >
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>

                <Link href="/super-admin" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-semibold">
                    <ArrowLeft size={18} /> Volver al Panel de Empresas
                </Link>

                <div className="grid gap-4">
                    <Link href="/scan" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                            <Scan size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800">Escanear Rollo</h3>
                            <p className="text-slate-500 text-sm">Cámara Activa</p>
                        </div>
                    </Link>

                    <Link href="/inventory" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
                            <Package size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800">Ver Stock</h3>
                            <p className="text-slate-500 text-sm">Consultar inventario global</p>
                        </div>
                    </Link>

                    <Link href="/products/new" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="p-4 bg-green-100 text-green-600 rounded-full">
                            <Plus size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800">Nuevo Producto</h3>
                            <p className="text-slate-500 text-sm">Crear artículo para una empresa</p>
                        </div>
                    </Link>
                </div>
            </div>
        </SuperAdminGuard>
    );
}