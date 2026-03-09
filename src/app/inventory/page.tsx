'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../AuthContext';
import { getCompanies, Company, Product } from '../../db/company-data';
import { Search, Package, MapPin, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { BottomNav } from '../../../BottomNav';

export default function InventoryPage() {
    const { currentUser } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser?.companyId) {
            const company = getCompanies().find(c => c.id === currentUser.companyId);
            if (company) {
                setProducts(company.products || []);
            }
        }
        setLoading(false);
    }, [currentUser]);

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalQuantity = filteredProducts.reduce((sum, p) => sum + p.quantity, 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-black text-slate-900">Stock Completo</h1>
                    <div className="flex flex-col items-end">
                        <div className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600 mb-1">
                            {filteredProducts.length} Artículos
                        </div>
                        <div className="text-xs font-bold text-blue-600">
                            Total: {totalQuantity.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o código..." 
                        className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="p-4 space-y-3">
                {loading ? (
                    <p className="text-center text-slate-400 mt-10">Cargando inventario...</p>
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div key={product.id} className={`bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center ${product.quantity < 5 ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{product.name}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{product.id}</span>
                                    {product.colorCode && (
                                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                                            {product.colorCode}
                                        </span>
                                    )}
                                    {product.location && (
                                        <span className="text-xs flex items-center gap-1 text-blue-600 font-medium">
                                            <MapPin size={12} /> {product.location}
                                        </span>
                                    )}
                                    {product.quantity < 5 && (
                                        <span className="text-xs flex items-center gap-1 text-red-600 font-bold">
                                            <AlertTriangle size={12} /> Bajo Stock
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-black text-slate-900">{product.quantity}</span>
                                <span className="text-xs text-slate-400 font-bold uppercase">Unidades</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        <Package size={48} className="mx-auto mb-2 opacity-20" />
                        <p>No se encontraron productos.</p>
                    </div>
                )}
            </div>
            
            <BottomNav />
        </div>
    );
}