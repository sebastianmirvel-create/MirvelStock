'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../AuthContext';
import { getCompanies, HistoryEntry } from '../../db/company-data';
import { BottomNav } from '../../../BottomNav';
import { History, ArrowUpRight, ArrowDownRight, Plus, FileSpreadsheet, AlertCircle, Filter, X } from 'lucide-react';

export default function HistoryPage() {
    const { currentUser } = useAuth();
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    
    // Filtros
    const [filterUser, setFilterUser] = useState('');
    const [filterProduct, setFilterProduct] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (currentUser?.companyId) {
            const company = getCompanies().find(c => c.id === currentUser.companyId);
            if (company) {
                // Ordenar por fecha descendente (más nuevo primero)
                setHistory([...(company.history || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }
        }
    }, [currentUser]);

    const getIcon = (action: string) => {
        switch (action) {
            case 'create': return <Plus size={18} className="text-green-600" />;
            case 'update': return <ArrowUpRight size={18} className="text-blue-600" />;
            case 'import': return <FileSpreadsheet size={18} className="text-purple-600" />;
            case 'delete': return <ArrowDownRight size={18} className="text-red-600" />;
            default: return <History size={18} className="text-slate-600" />;
        }
    };

    const filteredHistory = history.filter(entry => {
        const matchesUser = entry.userName.toLowerCase().includes(filterUser.toLowerCase());
        const matchesProduct = entry.productName.toLowerCase().includes(filterProduct.toLowerCase());
        // Comparación de fecha simple (YYYY-MM-DD)
        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        const matchesDate = filterDate ? entryDate === filterDate : true;
        
        return matchesUser && matchesProduct && matchesDate;
    });

    const clearFilters = () => {
        setFilterUser('');
        setFilterProduct('');
        setFilterDate('');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-2xl font-black text-slate-900">Historial</h1>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}
                    >
                        <Filter size={20} />
                    </button>
                </div>
                
                {showFilters && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-2 space-y-2 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-2">
                            <input 
                                type="text" 
                                placeholder="Usuario..." 
                                className="p-2 text-sm border border-slate-300 rounded-lg"
                                value={filterUser}
                                onChange={(e) => setFilterUser(e.target.value)}
                            />
                            <input 
                                type="date" 
                                className="p-2 text-sm border border-slate-300 rounded-lg"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Artículo / Producto..." 
                            className="w-full p-2 text-sm border border-slate-300 rounded-lg"
                            value={filterProduct}
                            onChange={(e) => setFilterProduct(e.target.value)}
                        />
                        {(filterUser || filterProduct || filterDate) && (
                            <button onClick={clearFilters} className="w-full text-xs text-red-500 flex items-center justify-center gap-1 py-1">
                                <X size={12} /> Limpiar Filtros
                            </button>
                        )}
                    </div>
                )}

                <p className="text-slate-500 text-sm">
                    {filteredHistory.length} movimientos encontrados
                </p>
            </div>

            <div className="p-4 space-y-3">
                {filteredHistory.length > 0 ? (
                    filteredHistory.map((entry) => (
                        <div key={entry.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-3">
                            <div className="mt-1 p-2 bg-slate-100 rounded-full h-fit">
                                {getIcon(entry.action)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-800 text-sm">{entry.productName}</h3>
                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                        {new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm mt-1">{entry.details}</p>
                                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                    Por: <span className="font-semibold text-slate-500">{entry.userName}</span>
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        <p>No hay movimientos registrados.</p>
                    </div>
                )}
            </div>
            <BottomNav />
        </div>
    );
}