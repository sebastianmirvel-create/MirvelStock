'use client';
import { useState } from 'react';
import { useAuth } from '../../../../AuthContext';
import { AdminGuard } from '../../../../AdminGuard';
import { getCompanies, saveCompanies, Product, Company } from '../../../db/company-data';
import { toast } from 'sonner';
import { Save, ArrowLeft, Box, Upload, Download, FileSpreadsheet, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function NewProductPage() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const [product, setProduct] = useState<Product>({
        id: '',
        name: '',
        quantity: 0,
        location: '',
        manufacturerCode: '', // Código del fabricante (el que viene en el código de barras)
        color: '', // Nombre del color (ej: Rojo)
        colorCode: '' // Código interno del color (ej: RJO)
    });

    const handleSave = (createAnother: boolean = false) => {
        if (!currentUser) return;
        
        // Validación básica
        if (!product.id.trim()) {
            toast.error("El código del producto es obligatorio");
            return;
        }
        if (!product.name.trim()) {
            toast.error("El nombre del producto es obligatorio");
            return;
        }

        const companies = getCompanies();
        // Usamos el companyId del usuario logueado
        const companyId = currentUser.companyId;

        if (!companyId) {
            toast.error("Error: No tienes una empresa asignada para crear productos.");
            return;
        }

        const companyIndex = companies.findIndex(c => c.id === companyId);
        if (companyIndex === -1) {
            toast.error("Empresa no encontrada");
            return;
        }

        const updatedCompany = { ...companies[companyIndex] };
        
        // Verificar duplicados
        if (updatedCompany.products.some(p => p.id === product.id)) {
            toast.error("Ya existe un producto con este código.");
            return;
        }

        updatedCompany.products.push(product);
        
        // Registrar Historial
        updatedCompany.history = updatedCompany.history || [];
        updatedCompany.history.unshift({
            id: Date.now().toString(),
            date: new Date().toISOString(),
            userName: currentUser.name,
            action: 'create',
            productId: product.id,
            productName: product.name,
            details: `Creado manualmente con ${product.quantity}`
        });

        companies[companyIndex] = updatedCompany;
        saveCompanies(companies);
        
        toast.success("Producto creado exitosamente");
        
        if (createAnother) {
            setProduct({ id: '', name: '', quantity: 0, location: '', manufacturerCode: '', color: '', colorCode: '' });
            // Foco opcional o reset de estado
        } else {
            router.back();
        }
    };

    // --- Lógica de Importación/Exportación (Reutilizada) ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser?.companyId) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                const newProducts = data.map((row: any) => ({
                    id: String(row.id || row.codigo || row.code || Math.random().toString(36).substr(2, 9)),
                    manufacturerCode: String(row.codigo_fabricante || row.manufacturer_code || row.codigo_proveedor || ''),
                    name: String(row.nombre || row.name || row.producto || 'Sin Nombre'),
                    quantity: Number(row.cantidad || row.quantity || row.stock || 0),
                    location: String(row.ubicacion || row.location || ''), // Ubicación en el depósito
                    color: String(row.color || ''), // Nombre del color
                    colorCode: String(row.codigo_color || row.color_code || '') // Código del color
                }));

                if (newProducts.length === 0) {
                    toast.error("No se encontraron productos válidos.");
                    return;
                }

                const companies = getCompanies();
                const companyIndex = companies.findIndex(c => c.id === currentUser.companyId);
                if (companyIndex !== -1) {
                    const updatedCompany = { ...companies[companyIndex] };
                    updatedCompany.products = [...updatedCompany.products, ...newProducts];
                    companies[companyIndex] = updatedCompany;
                    saveCompanies(companies);
                    toast.success(`${newProducts.length} productos importados.`);
                }
            } catch (error) {
                console.error(error);
                toast.error("Error al leer el archivo.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleExportProducts = () => {
        const companies = getCompanies();
        const company = companies.find(c => c.id === currentUser?.companyId);
        if (!company || !company.products || company.products.length === 0) {
            toast.error("No hay productos para exportar.");
            return;
        }
        // Lógica de exportación simplificada para este ejemplo
        const ws = XLSX.utils.json_to_sheet(company.products);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Productos");
        XLSX.writeFile(wb, `${company.name}_productos.xlsx`);
    };

    return (
        <AdminGuard>
            <div className="p-6 min-h-screen bg-slate-50">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-semibold">
                     <ArrowLeft size={18} /> Volver
                </button>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <Box size={24} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">Nuevo Producto</h1>
                </div>
                
                {/* Acciones Rápidas de Admin */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <div className="text-xs text-slate-500 mb-2 w-full px-1 text-pretty">
                        <p>Para importar, usa un Excel con columnas: <b>codigo, codigo_fabricante, nombre, color, cantidad, ubicacion</b></p>
                    </div>
                    <label className="cursor-pointer bg-blue-50 text-blue-700 font-bold py-2 px-4 rounded-lg border border-blue-200 hover:bg-blue-100 flex items-center gap-2 text-sm whitespace-nowrap">
                        <Upload size={16} />
                        Importar Excel
                        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <button onClick={handleExportProducts} className="bg-green-50 text-green-700 font-bold py-2 px-4 rounded-lg border border-green-200 hover:bg-green-100 flex items-center gap-2 text-sm whitespace-nowrap">
                        <Download size={16} />
                        Exportar Excel
                    </button>
                </div>

                {/* Formulario */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código Interno</label>
                            <input 
                                type="text" 
                                value={product.id}
                                onChange={e => setProduct({...product, id: e.target.value})}
                                className="w-full p-3 border border-slate-300 rounded-lg font-mono"
                                placeholder="Ej: MIR-001"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cód. Fabricante</label>
                            <input 
                                type="text" 
                                value={product.manufacturerCode}
                                onChange={e => setProduct({...product, manufacturerCode: e.target.value})}
                                className="w-full p-3 border border-slate-300 rounded-lg font-mono"
                                placeholder="Del código de barras"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                        <input 
                            type="text" 
                            value={product.name}
                            onChange={e => setProduct({...product, name: e.target.value})}
                            className="w-full p-3 border border-slate-300 rounded-lg"
                            placeholder="Ej: Tela Algodón"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Color / Variante</label>
                        <input 
                            type="text" 
                            value={product.color}
                            onChange={e => setProduct({...product, color: e.target.value})}
                            className="w-full p-3 border border-slate-300 rounded-lg"
                            placeholder="Ej: Rojo Fuego"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código Color</label>
                        <input 
                            type="text" 
                            value={product.colorCode}
                            onChange={e => setProduct({...product, colorCode: e.target.value})}
                            className="w-full p-3 border border-slate-300 rounded-lg"
                            placeholder="Ej: RJO"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cantidad / Metros</label>
                            <input 
                                type="number" 
                                value={product.quantity}
                                onChange={e => setProduct({...product, quantity: Number(e.target.value)})}
                                className="w-full p-3 border border-slate-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ubicación</label>
                            <input 
                                type="text" 
                                value={product.location}
                                onChange={e => setProduct({...product, location: e.target.value})}
                                className="w-full p-3 border border-slate-300 rounded-lg"
                                placeholder="Ej: A-12"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-6">
                        <button onClick={() => handleSave(false)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                            <Save size={20} /> Guardar y Salir
                        </button>
                        <button onClick={() => handleSave(true)} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 active:scale-95 transition-transform">
                            <Plus size={20} /> Guardar y Crear Otro
                        </button>
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}