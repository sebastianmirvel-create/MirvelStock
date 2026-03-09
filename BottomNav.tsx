'use client';

import Link from 'next/link';
import { Scan, Package, History, Home, Settings } from 'lucide-react';
import { useAuth } from './AuthContext';

const NavLink = ({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) => (
    <Link href={href} className="flex-1 flex flex-col items-center justify-end gap-1 h-full pb-3 group">
        <div className="p-1 rounded-lg group-active:bg-slate-100 transition-colors text-slate-500 group-hover:text-blue-600">
            {icon}
        </div>
        <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-600">{label}</span>
    </Link>
);

export const BottomNav = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null; // No mostrar la barra de navegación si no hay un usuario logueado
  }

  const role = currentUser.role;

  // Clases comunes: Bloque sólido al final del flex container, ancho completo, sin posición fija
  const navClasses = "w-full bg-white border-t border-slate-200 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] shrink-0";

  // For employees, we want a different layout (3 items)
  if (role === 'employee') {
    return (
        <nav className={navClasses}>
            <div className="flex items-end h-20">
                <NavLink href="/" icon={<Home size={24} strokeWidth={2} />} label="Inicio" />
                <div className="flex-1 flex justify-center relative -top-5">
                    <Link href="/scan" className="flex flex-col items-center justify-center bg-slate-900 rounded-full w-16 h-16 shadow-xl shadow-slate-900/30 border-4 border-slate-50 text-white active:scale-95 transition-transform">
                        <Scan size={28} />
                    </Link>
                </div>
                <NavLink href="/inventory" icon={<Package size={24} strokeWidth={2} />} label="Stock" />
            </div>
        </nav>
    );
  }

  // Admin layout (5 items)
  return (
    <nav className={navClasses}>
        <div className="flex items-end h-20">
            <NavLink href="/" icon={<Home size={24} strokeWidth={2} />} label="Inicio" />
            <NavLink href="/inventory" icon={<Package size={24} strokeWidth={2} />} label="Stock" />

            <div className="flex-1 flex justify-center relative -top-5">
                <Link href="/scan" className="flex flex-col items-center justify-center bg-slate-900 rounded-full w-16 h-16 shadow-xl shadow-slate-900/30 border-4 border-slate-50 text-white active:scale-95 transition-transform">
                    <Scan size={28} />
                </Link>
            </div>

            <NavLink href="/history" icon={<History size={24} strokeWidth={2} />} label="Historial" />
            <NavLink href="/products" icon={<Settings size={24} strokeWidth={2} />} label="Admin" />
        </div>
    </nav>
  );
};