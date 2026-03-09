'use client';
import { useState } from 'react';
import { Scanner } from '../../components/Scanner';
import { useAuth } from '../../../AuthContext';
import { getCompanies, saveCompanies, Product } from '../../db/company-data';
import { toast } from 'sonner';
import { Package, Plus, Minus, Save, X, Link as LinkIcon, Search, AlertTriangle } from 'lucide-react';

export default function ScanPage() {
  const { currentUser } = useAuth();
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [linkSearch, setLinkSearch] = useState('');
  const [showLinkOptions, setShowLinkOptions] = useState(false);

  // Manejar el resultado del escaneo
  const handleScan = (code: string) => {
    if (!currentUser || !currentUser.companyId) {
        toast.error("Error: No tienes una empresa asignada.");
        return;
    }

    const companies = getCompanies();
    const myCompany = companies.find(c => c.id === currentUser.companyId);
    
    if (!myCompany) return;

    // Buscar por ID interno O por código de fabricante
    const product = myCompany.products.find(p => p.id === code || p.manufacturerCode === code);
    setScannedCode(code);

    if (product) {
        setScannedProduct({ ...product }); // Copia para editar
        setIsNewProduct(false);
        toast.success("Producto encontrado");
    } else {
        // Si es nuevo, asumimos que el código escaneado es el ID principal por defecto, pero se puede cambiar
        setScannedProduct({ id: code, name: '', quantity: 0, location: '', manufacturerCode: code, color: '', colorCode: '' });
        setIsNewProduct(true);
        setLinkSearch(''); // Resetear búsqueda
        setShowLinkOptions(false);
        toast.info("Producto nuevo. Complétalo para guardarlo.");
    }
  };

  const handleSave = () => {
    if (!currentUser?.companyId || !scannedProduct) return;

    const companies = getCompanies();
    const companyIndex = companies.findIndex(c => c.id === currentUser.companyId);
    
    if (companyIndex === -1) return;

    const updatedCompany = { ...companies[companyIndex] };
    const oldProduct = updatedCompany.products.find(p => p.id === scannedProduct.id);
    const oldQuantity = oldProduct ? oldProduct.quantity : 0;
    
    if (isNewProduct) {
        updatedCompany.products.push(scannedProduct);
        // Registrar Historial: Creación
        updatedCompany.history = updatedCompany.history || [];
        updatedCompany.history.unshift({
            id: Date.now().toString(),
            date: new Date().toISOString(),
            userName: currentUser.name,
            action: 'create',
            productId: scannedProduct.id,
            productName: scannedProduct.name,
            details: `Creado con ${scannedProduct.quantity} unidades`
        });
    } else {
        updatedCompany.products = updatedCompany.products.map(p => 
            p.id === scannedProduct.id ? scannedProduct : p
        );
        // Registrar Historial: Actualización
        if (oldQuantity !== scannedProduct.quantity) {
            updatedCompany.history = updatedCompany.history || [];
            updatedCompany.history.unshift({
                id: Date.now().toString(),
                date: new Date().toISOString(),
                userName: currentUser.name,
                action: 'update',
                productId: scannedProduct.id,
                productName: scannedProduct.name,
                details: `Stock: ${oldQuantity} -> ${scannedProduct.quantity}`
            });
        }
    }

    companies[companyIndex] = updatedCompany;
    saveCompanies(companies);
    
    toast.success(isNewProduct ? "Producto creado" : "Stock actualizado");
    setScannedProduct(null); // Volver al escáner
  };

  const handleLinkProduct = (existingProduct: Product) => {
    if (!currentUser?.companyId || !scannedProduct) return;

    if (!confirm(`¿Vincular el código "${scannedCode}" al producto "${existingProduct.name}"?\n\nEsto actualizará el ID del producto existente.`)) {
        return;
    }

    const companies = getCompanies();
    const companyIndex = companies.findIndex(c => c.id === currentUser.companyId);
    if (companyIndex === -1) return;

    const updatedCompany = { ...companies[companyIndex] };
    
    // Actualizamos el producto existente: le cambiamos su ID viejo por el nuevo escaneado
    updatedCompany.products = updatedCompany.products.map(p => {
        if (p.id === existingProduct.id) {
            return { ...p, id: scannedCode }; // Actualizar ID
        }
        return p;
    });

    companies[companyIndex] = updatedCompany;
    saveCompanies(companies);

    toast.success("¡Producto vinculado correctamente!");
    
    // Cargar el producto ya vinculado para editarlo si se quiere
    setScannedProduct({ ...existingProduct, id: scannedCode });
    setIsNewProduct(false);
    setShowLinkOptions(false);
  };

  return (
    <div className="p-4 flex flex-col h-full">
      {!scannedProduct ? (
        <>
          <h2 className="text-xl font-bold mb-4 text-center text-slate-800">CÁMARA ACTIVA</h2>
          <Scanner onScan={handleScan} />
          <p className="mt-6 text-center text-slate-500 text-sm px-8">
            Simula un escaneo tocando el botón de la cámara.
          </p>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-black text-slate-800">{isNewProduct ? 'Nuevo Producto' : 'Editar Stock'}</h2>
                <button onClick={() => setScannedProduct(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Código</label>
                    <div className="font-mono text-lg text-slate-700 bg-slate-100 p-2 rounded">{scannedCode}</div>
                </div>

                {scannedProduct.manufacturerCode && scannedProduct.manufacturerCode !== scannedProduct.id && (
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Código Fabricante</label>
                        <div className="font-mono text-sm text-slate-500">{scannedProduct.manufacturerCode}</div>
                    </div>
                )}

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Color / Variante</label>
                    <input type="text" value={scannedProduct.color || ''} onChange={e => setScannedProduct({...scannedProduct, color: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Ej: Azul Marino" />
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Código Color</label>
                    <input type="text" value={scannedProduct.colorCode || ''} onChange={e => setScannedProduct({...scannedProduct, colorCode: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Ej: RJO" />
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                    <input type="text" value={scannedProduct.name} onChange={e => setScannedProduct({...scannedProduct, name: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg font-bold text-lg" placeholder="Nombre del producto" />
                    
                    {isNewProduct && (
                        <div className="mt-2">
                            <button 
                                onClick={() => setShowLinkOptions(!showLinkOptions)}
                                className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
                            >
                                <LinkIcon size={14} /> O vincular con producto existente...
                            </button>
                            
                            {showLinkOptions && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-200 mb-2">
                                        <Search size={16} className="text-slate-400"/>
                                        <input 
                                            type="text" 
                                            placeholder="Buscar por nombre..." 
                                            className="w-full outline-none text-sm"
                                            value={linkSearch}
                                            onChange={(e) => setLinkSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                        {getCompanies().find(c => c.id === currentUser?.companyId)?.products
                                            .filter(p => p.name.toLowerCase().includes(linkSearch.toLowerCase()) && linkSearch.length > 0)
                                            .map(p => (
                                                <button 
                                                    key={p.id} 
                                                    onClick={() => handleLinkProduct(p)}
                                                    className="w-full text-left p-2 hover:bg-blue-100 rounded-lg text-sm flex justify-between items-center"
                                                >
                                                    <span className="font-medium text-slate-700">{p.name}</span>
                                                    <span className="text-xs text-slate-400">{p.quantity} un.</span>
                                                </button>
                                            ))
                                        }
                                        {linkSearch.length > 0 && getCompanies().find(c => c.id === currentUser?.companyId)?.products.filter(p => p.name.toLowerCase().includes(linkSearch.toLowerCase())).length === 0 && (
                                            <p className="text-xs text-slate-400 text-center py-2">No se encontraron productos</p>
                                        )}
                                        {linkSearch.length === 0 && (
                                            <p className="text-xs text-blue-400 text-center py-2">Escribe para buscar...</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Cantidad / Metros</label>
                    {scannedProduct.quantity < 5 && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-lg mb-2 text-sm font-bold animate-pulse">
                            <AlertTriangle size={16} />
                            ¡Stock Bajo! Menos de 5 metros
                        </div>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                        <button onClick={() => setScannedProduct({...scannedProduct, quantity: Math.max(0, scannedProduct.quantity - 1)})} className="p-3 bg-red-100 text-red-600 rounded-lg"><Minus size={24} /></button>
                        <input type="number" value={scannedProduct.quantity} onChange={e => setScannedProduct({...scannedProduct, quantity: Number(e.target.value)})} className="w-full text-center p-3 border border-slate-300 rounded-lg font-black text-3xl" />
                        <button onClick={() => setScannedProduct({...scannedProduct, quantity: scannedProduct.quantity + 1})} className="p-3 bg-green-100 text-green-600 rounded-lg"><Plus size={24} /></button>
                    </div>
                </div>

                <button onClick={handleSave} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-600/20 active:scale-95 transition-transform">
                    <Save size={20} /> {isNewProduct ? 'Crear Producto' : 'Guardar Cambios'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
