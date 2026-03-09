'use client';

import { useEffect, useState } from 'react';
import { useAuth, User } from '../../../../AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { User as UserIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getCompanies, Company } from '../../../db/company-data';

export default function CompanyLoginPage() {
    const { login, openPinModal } = useAuth();
    const router = useRouter();
    const params = useParams();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Aseguramos que companyId sea un string
        const companyId = Array.isArray(params?.companyId) ? params.companyId[0] : params?.companyId;
        
        if (companyId) {
            const foundCompany = getCompanies().find(c => c.id === companyId);
            if (foundCompany) {
                setCompany(foundCompany);
            }
        }
        setLoading(false);
    }, [params]);

    if (loading) return <div className="p-10 text-center">Cargando...</div>;
    if (!company) return notFound();

    const handleUserSelect = (user: User) => {
        if (user.role === 'admin') {
            openPinModal(user);
        } else {
            login(user);
            router.push('/');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter">{company.name}</h1>
                    <p className="text-xs font-bold text-blue-600 tracking-widest mb-6">PORTAL DE EMPLEADOS</p>
                    <h2 className="text-2xl font-bold text-slate-800">¿Quién eres?</h2>
                    <p className="text-slate-500">Selecciona tu usuario para continuar</p>
                </div>

                <div className="space-y-3">
                    {company.users.map((user) => (
                        <button key={user.name} onClick={() => handleUserSelect(user)} className="w-full flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-left active:scale-[0.98] active:bg-slate-50 transition-all">
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
            </div>
        </div>
    );
}