'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { SuperAdminGuard } from '../../../../db/SuperAdminGuard';
import { getCompanies, saveCompanies, Company, HistoryEntry } from '../../../../db/company-data';
import { User, UserRole } from '../../../../../AuthContext';
import { ArrowLeft, Building2, Save, User as UserIcon, Plus, Trash2, Shield, AlertTriangle, UserCog, Tag, FileSpreadsheet, Upload, Download, FileDown } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function EditCompanyPage({ params }: { params: { companyId: string } }) {
    const router = useRouter();
    const [company, setCompany] = useState<Company | null>(null);
    const [companyName, setCompanyName] = useState('');
    const [companyId, setCompanyId] = useState('');
    
    // Estado para Roles
    const [roles, setRoles] = useState<string[]>([]);
    const [newRoleName, setNewRoleName] = useState('');

    // Estado para Usuarios
    const [users, setUsers] = useState<User[]>([]);
    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState('');

    useEffect(() => {
        const companyData = getCompanies().find(c => c.id === params.companyId);
        if (companyData) {
            setCompany(companyData);
            setCompanyName(companyData.name);
            setCompanyId(companyData.id);
            
            // Cargar roles o usar predeterminados si no existen
            const companyRoles = companyData.roles && companyData.roles.length > 0 
                ? companyData.roles 
                : ['admin', 'empleado'];
            setRoles(companyRoles);
            setNewUserRole(companyRoles[0] || 'empleado');
            
            setUsers(companyData.users);
        } else {
            notFound();
        }
    }, [params.companyId]);

    // Función auxiliar para guardar todo el estado global
    const saveChanges = (updatedCompany: Company) => {
        const allCompanies = getCompanies();
        const index = allCompanies.findIndex(c => c.id === updatedCompany.id);
        if (index !== -1) {
            allCompanies[index] = updatedCompany;
            saveCompanies(allCompanies);
            setCompany(updatedCompany); // Actualizar estado local
        }
    };

    const handleSaveCompanyName = () => {
        if (!company) return;
        // Al guardar el nombre, también actualizamos el ID por si se cambió en la zona de peligro.
        const updatedCompany = { ...company, name: companyName, id: companyId };
        saveChanges(updatedCompany);
        toast.success(`Nombre de la empresa actualizado a "${companyName}"`);
    };

    const handleUpdateCompanyId = () => {
        if (!company || !companyId.trim() || companyId === company.id) return;

        const newId = companyId.trim();

        if (!confirm(`Estás a punto de cambiar el ID de la empresa de "${company.id}" a "${newId}".\n\nEsto cambiará la URL de acceso y es una acción avanzada. Todos los links guardados dejarán de funcionar.\n\n¿Estás seguro?`)) {
            return;
        }

        const allCompanies = getCompanies();

        if (allCompanies.some(c => c.id === newId)) {
            toast.error(`El ID "${newId}" ya está en uso por otra empresa.`);
            return;
        }

        const companyIndex = allCompanies.findIndex(c => c.id === company.id);
        if (companyIndex === -1) {
            toast.error("Error crítico: No se pudo encontrar la empresa original para actualizar.");
            return;
        }

        const updatedCompany: Company = {
            ...company,
            id: newId,
            name: companyName,
            users: users.map(user => ({ ...user, companyId: newId }))
        };

        allCompanies[companyIndex] = updatedCompany;
        saveCompanies(allCompanies);

        toast.success("¡Éxito! El ID de la empresa y la URL de acceso han sido actualizados.");
        router.push(`/super-admin/companies/${newId}`);
    };

    // --- Gestión de Roles ---
    const handleAddRole = () => {
        const role = newRoleName.trim().toLowerCase();
        if (!role) return;
        if (roles.includes(role)) {
            toast.error('Este rol ya existe.');
            return;
        }
        const updatedRoles = [...roles, role];
        setRoles(updatedRoles);
        if (company) saveChanges({ ...company, roles: updatedRoles });
        setNewRoleName('');
        toast.success(`Rol "${role}" creado.`);
    };

    const handleDeleteRole = (roleToDelete: string) => {
        if (roleToDelete === 'admin') {
            toast.error('No puedes eliminar el rol admin.');
            return;
        }
        const updatedRoles = roles.filter(r => r !== roleToDelete);
        setRoles(updatedRoles);
        if (company) saveChanges({ ...company, roles: updatedRoles });
    };

    // --- Gestión de Usuarios ---
    const handleAddUser = () => {
        if (newUserName && newUserName.trim()) {
            const newUser: User = {
                name: newUserName,
                role: newUserRole,
                companyId: params.companyId,
            };
            const updatedUsers = [...users, newUser];
            setUsers(updatedUsers);
            if (company) saveChanges({ ...company, users: updatedUsers });
            setNewUserName(''); // Limpiar input
            toast.success(`Usuario "${newUserName}" agregado.`);
        }
    };
    
    const handleDeleteUser = (userName: string) => {
        if (confirm(`¿Seguro que quieres eliminar al usuario "${userName}"?`)) {
            const updatedUsers = users.filter(u => u.name !== userName);
            setUsers(updatedUsers);
            if (company) saveChanges({ ...company, users: updatedUsers });
            toast.error(`Usuario "${userName}" eliminado.`);
        }
    };

    // --- Gestión de Productos (Importación) ---
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

                // Mapear datos del Excel a la estructura de Producto
                // Se asume que el Excel tiene columnas: id (o codigo), nombre, cantidad, ubicacion
                const importedProducts = data.map((row: any) => ({
                    id: String(row.id || row.codigo || row.code || `NUEVO-${Math.random().toString(36).substr(2, 5).toUpperCase()}`),
                    manufacturerCode: String(row.codigo_fabricante || row.manufacturer_code || row.codigo_proveedor || ''),
                    name: String(row.nombre || row.name || row.producto || 'Sin Nombre'),
                    color: String(row.color || ''),
                    colorCode: String(row.codigo_color || row.color_code || ''),
                    quantity: Number(row.cantidad || row.quantity || row.stock || 0),
                    location: String(row.ubicacion || row.location || ''),
                }));

                if (importedProducts.length === 0) {
                    toast.error("No se encontraron productos válidos en el archivo.");
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
                    userName: 'Super Admin',
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
                console.error("Error al importar:", error);
                toast.error("Error al leer el archivo Excel.");
            }
        };
        reader.readAsBinaryString(file);
    };

    // --- Exportar Productos a Excel ---
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

    const handleChangeUserRole = (userName: string, currentRole: string) => {
        // Creamos un string con las opciones para el prompt (solución simple por ahora)
        const roleOptions = roles.join(', ');
        const newRole = prompt(
            `Cambiar rol de "${userName}".\n\nRoles disponibles: ${roleOptions}\n\nEscribe el nuevo rol:`, 
            currentRole
        );
        
        if (!newRole || newRole.trim() === "" || newRole === currentRole) return;

        let roleToSave = newRole.toLowerCase().trim();
        
        // Validar que el rol exista en la lista (opcional, pero recomendado)
        if (!roles.includes(roleToSave) && roleToSave !== 'admin') {
             if(!confirm(`El rol "${roleToSave}" no está en la lista de roles definidos. ¿Asignarlo de todas formas?`)) return;
        }

        // Normalizar "administrador" a "admin" para que el sistema reconozca los permisos
        if (roleToSave === 'administrador') roleToSave = 'admin';

        const updatedUsers = users.map(u => {
            if (u.name === userName) {
                toast.info(`Rol de ${userName} cambiado a ${roleToSave}`);
                return { ...u, role: roleToSave };
            }
            return u;
        });
        setUsers(updatedUsers);
        if (company) saveChanges({ ...company, users: updatedUsers });
    };

    if (!company) {
        return <div className="p-8 text-center">Cargando...</div>;
    }

    return (
        <SuperAdminGuard>
            <div className="p-6">
                <Link href="/super-admin" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-semibold">
                    <ArrowLeft size={18} /> Volver al Panel
                </Link>
                
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-slate-100 text-slate-500 rounded-lg"><Building2 size={28} /></div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">{company.name}</h1>
                        <p className="text-slate-400 font-mono">{company.id}</p>
                    </div>
                </div>

                {/* Editar Nombre de la Empresa */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 mb-8">
                    <h2 className="text-xl font-bold mb-4">Configuración General</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="flex-grow p-3 border border-slate-300 rounded-lg"
                        />
                        <button onClick={handleSaveCompanyName} className="bg-blue-600 text-white font-bold py-3 px-5 rounded-lg flex items-center justify-center gap-2">
                            <Save size={18} /> Guardar Nombre
                        </button>
                    </div>
                </div>

                {/* Zona de Peligro - Cambiar ID */}
                <div className="bg-red-50 border-2 border-dashed border-red-200 p-6 rounded-2xl mt-8">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" size={24} />
                        <div>
                            <h2 className="text-xl font-bold text-red-800">Zona de Peligro</h2>
                            <p className="text-red-700 mt-1 mb-4 text-sm">Cambiar el ID de la empresa modificará permanentemente su URL de acceso. Esta acción no se puede deshacer.</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-2">
                        <input
                            type="text"
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                            className="flex-grow p-3 border border-red-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-red-400 focus:outline-none"
                        />
                        <button onClick={handleUpdateCompanyId} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-5 rounded-lg flex items-center justify-center gap-2">
                            <Save size={18} /> Actualizar ID y URL
                        </button>
                    </div>
                </div>

                {/* Gestionar Roles */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 mb-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Tag size={20}/> Roles y Puestos</h2>
                    <p className="text-sm text-slate-500 mb-4">Define los puestos disponibles en esta empresa (ej: vendedor, repositor, gerente).</p>
                    
                    <div className="flex gap-2 mb-4">
                        <input 
                            type="text" 
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            placeholder="Nuevo rol (ej. vendedor)"
                            className="p-2 border border-slate-300 rounded-lg"
                        />
                        <button onClick={handleAddRole} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm">Crear Rol</button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {roles.map(role => (
                            <span key={role} className={`px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium ${role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                                {role}
                                {role !== 'admin' && (
                                    <button onClick={() => handleDeleteRole(role)} className="text-slate-400 hover:text-red-500 ml-1 font-bold">×</button>
                                )}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Importar Productos */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 mb-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FileSpreadsheet size={20}/> Importar Productos</h2>
                    <p className="text-sm text-slate-500 mb-4 text-pretty">
                        Carga un archivo Excel (.xlsx) con las columnas: <b>codigo, codigo_fabricante, nombre, color, codigo_color, cantidad, ubicacion</b>.
                        <br/>Si no tienen código, el sistema generará uno temporal que podrás vincular al escanear.
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <button onClick={handleDownloadTemplate} className="bg-slate-100 text-slate-600 font-bold py-3 px-6 rounded-xl border-2 border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-2">
                            <FileDown size={20} />
                            Plantilla
                        </button>

                        <label className="cursor-pointer bg-blue-50 text-blue-600 font-bold py-3 px-6 rounded-xl border-2 border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all flex items-center gap-2">
                            <Upload size={20} />
                            Seleccionar Archivo Excel
                            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                        </label>
                        
                        <button onClick={handleExportProducts} className="bg-green-50 text-green-600 font-bold py-3 px-6 rounded-xl border-2 border-green-100 hover:bg-green-100 hover:border-green-200 transition-all flex items-center gap-2">
                            <Download size={20} />
                            Exportar Actuales
                        </button>

                        <div className="text-sm text-slate-400">
                            {company.products?.length || 0} productos en base de datos.
                        </div>
                    </div>
                </div>

                {/* Gestionar Usuarios */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                    <h2 className="text-xl font-bold mb-4">Usuarios de la Empresa</h2>
                    
                    {/* Formulario de Agregar Usuario */}
                    <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200 flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                        <div className="flex-grow w-full">
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">Nombre</label>
                            <input 
                                type="text" 
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                placeholder="Ej: Juan Perez"
                                className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">Rol Asignado</label>
                            <select 
                                value={newUserRole}
                                onChange={(e) => setNewUserRole(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                            >
                                {roles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleAddUser} className="w-full sm:w-auto bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 h-[42px]">
                            <Plus size={18} /> Agregar Usuario
                        </button>
                    </div>
                    <div className="space-y-2">
                        {users.map(user => (
                            <div key={user.name} className="bg-slate-50 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-200 text-slate-600'}`}>
                                        <UserIcon size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{user.name}</p>
                                        <p className="text-xs text-slate-500 capitalize">{user.role === 'admin' ? 'Administrador' : user.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleChangeUserRole(user.name, user.role)} className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-100" title="Cambiar Rol">
                                        <UserCog size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteUser(user.name)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-100" title="Eliminar Usuario">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {users.length === 0 && (
                            <p className="text-center text-slate-400 py-4">No hay usuarios en esta empresa.</p>
                        )}
                    </div>
                </div>
            </div>
        </SuperAdminGuard>
    );
}