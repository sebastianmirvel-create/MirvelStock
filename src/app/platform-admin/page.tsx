'use client';
import { useState, useEffect } from 'react';
import { getCompanies, Company, superAdmin } from '../../db/company-data';
import { Building2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth, User } from '../../../AuthContext';
import { useRouter } from 'next/navigation';

export default function PlatformAdminLoginPage() {
    const { login, openPinModal } = useAuth();
    const router = useRouter();
    // Usamos un estado para simular que la lista de empresas se actualiza
    const [companies, setCompanies] = useState<Company[]>([]);

    useEffect(() => {
        // Cargar empresas guardadas al iniciar
        setCompanies(getCompanies());
    }, []);

    const handleUserSelect = (user: User) => {
        if (user.role === 'admin') {
            // Para el admin, primero abrimos el modal del PIN.
            // El modal se encargará de llamar a `login` si el PIN es correcto.
            openPinModal(user);
        } else {
            // Para empleados, el login es directo.
            login(user);
            router.push('/');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Depósito Pro</h1>
                    <p className="text-xs font-bold text-blue-600 tracking-widest mb-6">PLATAFORMA MULTI-EMPRESA</p>
                    <h2 className="text-2xl font-bold text-slate-800">¿Quién eres?</h2>
                    <p className="text-slate-500">Selecciona tu usuario para continuar</p>
                </div>

                <div className="space-y-6">
                    {/* Super Admin */}
                    <button
                        onClick={() => handleUserSelect(superAdmin)}
                        className="w-full flex items-center gap-4 p-4 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 text-left active:scale-[0.98] transition-all"
                    >
                        <div className="p-3 rounded-full bg-slate-800 text-yellow-400">
                            <ShieldCheck size={24} />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bold text-lg">{superAdmin.name}</h2>
                            <span className="text-xs text-slate-400 uppercase font-bold">Dueño / Super Admin</span>
                        </div>
                    </button>

                    {/* Lista de Empresas */}
                    {companies.map((company) => (
                        <div key={company.id} className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-400 px-2">
                                <Building2 size={14} />
                                <span className="text-xs font-bold uppercase tracking-wider">{company.name}</span>
                            </div>
                            {company.users.map((user) => (
                        <button
                            key={user.name}
                            onClick={() => handleUserSelect(user)}
                            className="w-full flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-left active:scale-[0.98] active:bg-slate-50 transition-all"
                        >
                            <div className={`p-2 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                                <UserIcon size={20} />
                            </div>
                            <div className="flex-1">
                                <h2 className="font-bold text-slate-800">{user.name}</h2>
                                <p className="text-xs text-slate-400 capitalize">{user.role === 'admin' ? 'Administrador' : user.role}</p>
                            </div>
                        </button>
                    ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
