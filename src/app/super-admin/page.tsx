'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SuperAdminGuard } from '../../db/SuperAdminGuard';
import { getCompanies, saveCompanies, Company, superAdmin, createEmptyCompany } from '../../db/company-data';
import { Building2, Link as LinkIcon, Plus, Edit, ShieldCheck } from 'lucide-react';
import { useAuth, User } from '../../../AuthContext';
import { useRouter } from 'next/navigation';

// Función para crear un 'slug' amigable para la URL a partir del nombre
const createSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

export default function SuperAdminDashboard() {
    const { login, openPinModal } = useAuth();
    const router = useRouter();
    // Usamos un estado para simular que la lista de empresas se actualiza
    const [companies, setCompanies] = useState<Company[]>([]);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');

    useEffect(() => {
        // Cargar empresas guardadas al iniciar
        setCompanies(getCompanies());
    }, []);

    const handleAddCompany = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCompanyName.trim()) return;

        const slug = createSlug(newCompanyName);
        // usar el constructor para mantener consistencia
        const newCompany: Company = createEmptyCompany(slug, newCompanyName);

        const updatedCompanies = [...companies, newCompany];
        setCompanies(updatedCompanies);
        saveCompanies(updatedCompanies); // Guardar cambios
        
        const link = `${window.location.origin}/${slug}/login`;
        setGeneratedLink(link);
        setNewCompanyName('');
    };

    return (
        <SuperAdminGuard>
            <div className="p-6">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Panel de Super Admin</h1>
                <p className="text-slate-500 mb-8">Gestiona todas las empresas de la plataforma.</p>

                {/* Botón para ir a la App de Admin (Scanner, Stock, etc.) */}
                <div className="mb-8">
                    <Link href="/super-admin/app" className="w-full bg-slate-900 text-white p-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20 active:scale-95 transition-transform">
                        <div className="p-2 bg-slate-800 rounded-full text-yellow-400">
                            <ShieldCheck size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg leading-tight">Usar App Admin</h3>
                            <p className="text-xs text-slate-400">Escanear, Stock y Productos Globales</p>
                        </div>
                    </Link>
                </div>

                {/* Formulario para crear una nueva empresa */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 mb-8">
                    <h2 className="text-xl font-bold mb-4">Crear Nueva Empresa</h2>
                    <form onSubmit={handleAddCompany} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={newCompanyName}
                            onChange={(e) => setNewCompanyName(e.target.value)}
                            placeholder="Nombre de la nueva empresa"
                            className="flex-grow p-3 border border-slate-300 rounded-lg"
                        />
                        <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-5 rounded-lg flex items-center justify-center gap-2">
                            <Plus size={18} /> Crear
                        </button>
                    </form>
                    {generatedLink && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                            <p className="font-bold text-blue-800">¡Empresa Creada! Link de acceso:</p>
                            <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-mono break-all">{generatedLink}</a>
                        </div>
                    )}
                </div>

                {/* Lista de empresas existentes */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Empresas Activas</h2>
                    <div className="space-y-2">
                        {companies.map(company => (
                            <div key={company.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-100 text-slate-500 rounded-lg"><Building2 size={20} /></div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{company.name}</h3>
                                        <p className="text-xs text-slate-400 font-mono">{company.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/super-admin/companies/${company.id}`} className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-2 rounded-lg" title="Editar Empresa">
                                        <Edit size={18} />
                                    </Link>
                                    <a href={`/${company.id}/login`} target="_blank" rel="noopener noreferrer" className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg" title="Ver Login"><LinkIcon size={18} /></a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SuperAdminGuard>
    );
}