'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../AuthContext';
import { AdminGuard } from '../../../AdminGuard';
import { getCompanies, saveCompanies, Company, HistoryEntry } from '../../db/company-data';
import { FileSpreadsheet, Upload, Download, Users, Tag, Plus, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function ProductsAdminPage() {
    const { currentUser } = useAuth();
    const [company, setCompany] = useState<Company | null>(null);

    useEffect(() => {
        if (currentUser?.companyId) {
            const foundCompany = getCompanies().find(c => c.id === currentUser.companyId);
            if (foundCompany) {
                setCompany(foundCompany);
            }
        }
    }, [currentUser]);

    const saveChanges = (updatedCompany: Company) => {
        const allCompanies = getCompanies();
        const index = allCompanies.findIndex(c => c.id === updatedCompany.id);
        if (index !== -1) {
            allCompanies[index] = updatedCompany;
            saveCompanies(allCompanies);
            setCompany(updatedCompany);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !company) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                const importedProducts = data.map((row: any) => ({
                    id: String(row.id || row.codigo || row.code || `NUEVO-${Math.random().toString(36).substr(2, 5).toUpperCase()}`),
                    manufacturerCode: String(row.codigo_fabricante || row.manufacturer_code || row.codigo_proveedor || ''),
                    name: String(row.nombre || row.name || row.producto || 'Sin Nombre'),
                    quantity: Number(row.cantidad || row.quantity || row.stock || 0),
                    location: String(row.ubicacion || row.location || ''),
                    color: String(row.color || ''),
                    colorCode: String(row.codigo_color || row.color_code || '')
                }));

                if (importedProducts.length === 0) {
                    toast.error("No se encontraron productos válidos.");
                    return;
                }

                // Lógica de Fusión (Merge): Actualizar existentes, agregar nuevos
                let updatedProducts = [...(company.products || [])];
                let newCount = 0;
                let updatedCount = 0;

                importedProducts.forEach(imported => {
                    const index = updatedProducts.findIndex(p => p.id === imported.id);
                    if (index !== -1) {
                        updatedProducts[index] = { ...updatedProducts[index], ...imported };
                        updatedCount++;
                    } else {
                        updatedProducts.push(imported);
                        newCount++;
                    }
                });

                // Registrar en Historial
                const historyEntry: HistoryEntry = {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    userName: currentUser?.name || 'Admin',
                    action: 'import',
                    productName: 'Importación Masiva',
                    details: `Carga Excel: ${newCount} nuevos, ${updatedCount} actualizados.`
                };

                const updatedCompany = { ...company, products: updatedProducts };
                updatedCompany.history = updatedCompany.history || [];
                updatedCompany.history.unshift(historyEntry);

                saveChanges(updatedCompany);
                toast.success(`Importación: ${newCount} creados, ${updatedCount} actualizados.`);
            } catch (error) {
                console.error(error);
                toast.error("Error al leer el archivo.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleExportProducts = () => {
        if (!company || !company.products || company.products.length === 0) {
            toast.error("No hay productos para exportar.");
            return;
        }

        const ws = XLSX.utils.json_to_sheet(company.products.map(p => ({
            codigo: p.id,
            codigo_fabricante: p.manufacturerCode,
            nombre: p.name,
            codigo_color: p.colorCode,
            color: p.color,
            cantidad: p.quantity,
            ubicacion: p.location
        })));
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Productos");
        XLSX.writeFile(wb, `${company.name.replace(/\s+/g, '_')}_productos.xlsx`);
    };

    const handleDownloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { 
                codigo: "EJEMPLO-001", 
                codigo_fabricante: "779123456789", 
                nombre: "Tela Ejemplo", 
                codigo_color: "RJO",
                color: "Rojo", 
                cantidad: 100, 
                ubicacion: "A-01" 
            }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
        XLSX.writeFile(wb, "plantilla_productos.xlsx");
    };

    if (!company) return <div className="p-8 text-center">Cargando empresa...</div>;

    return (
        <AdminGuard>
            <div className="p-6 pb-24">
                <h1 className="text-2xl font-black text-slate-900 mb-6">Administración</h1>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <FileSpreadsheet size={20} className="text-blue-600"/> 
                        Inventario Masivo
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">
                        Importa o exporta tu lista de productos desde Excel.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <Link href="/products/new" className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2 mb-4">
                            <Plus size={20} />
                            Crear Producto Manualmente
                        </Link>

                        <button onClick={handleDownloadTemplate} className="w-full bg-slate-100 text-slate-600 font-bold py-3 px-6 rounded-xl border-2 border-slate-200 hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                            <FileDown size={20} />
                            Descargar Plantilla Vacía
                        </button>

                        <label className="w-full cursor-pointer bg-blue-50 text-blue-700 font-bold py-4 px-6 rounded-xl border-2 border-blue-100 hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
                            <Upload size={20} />
                            Importar Excel
                            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                        </label>
                        
                        <button onClick={handleExportProducts} className="w-full bg-green-50 text-green-700 font-bold py-4 px-6 rounded-xl border-2 border-green-100 hover:bg-green-100 transition-all flex items-center justify-center gap-2">
                            <Download size={20} />
                            Exportar Excel
                        </button>
                    </div>
                    <div className="mt-4 text-center text-xs text-slate-400">
                        {company.products?.length || 0} productos en base de datos.
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}
