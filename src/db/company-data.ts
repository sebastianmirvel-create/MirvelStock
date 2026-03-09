import { User, UserRole } from '../../AuthContext';

export interface Product {
    id: string; // Código de barras o QR
    name: string;
    quantity: number;
    location?: string;
    manufacturerCode?: string; // Código del fabricante (el que viene en el código de barras)
    color?: string;
    colorCode?: string; // Código interno del color (ej: RJO, AZL)
}

export interface HistoryEntry {
    id: string;
    date: string;
    userName: string;
    action: 'create' | 'update' | 'delete' | 'import';
    productId?: string;
    productName: string;
    details: string;
}

export interface Company {
    id: string;
    name: string;
    roles: string[];
    users: User[];
    products: Product[];
    history: HistoryEntry[];
}

// Helper para construir un objeto Company con campos obligatorios inicializados
export const createEmptyCompany = (id: string, name: string): Company => ({
    id,
    name,
    roles: [],
    users: [],
    products: [],
    history: []
});

const initialCompanies: Company[] = [
    {
        id: 'textiles-del-sur',
        name: 'Textiles del Sur S.A.',
        roles: ['admin', 'empleado', 'vendedor'],
        users: [
            { name: 'Juan', role: 'employee' as UserRole, companyId: 'textiles-del-sur' },
            { name: 'Maria', role: 'employee' as UserRole, companyId: 'textiles-del-sur' },
        ],
        products: [
            { id: 'ROLLO-001', name: 'Tela Algodón Blanca', quantity: 50, location: 'A-12' },
            { id: 'ROLLO-002', name: 'Tela Polyester Azul', quantity: 120, location: 'B-05' }
        ],
        history: []
    },
    {
        id: 'distribuidora-norte',
        name: 'Distribuidora Norte',
        roles: ['admin', 'empleado', 'gerente', 'repositor'],
        users: [
            { name: 'Carlos', role: 'employee' as UserRole, companyId: 'distribuidora-norte' },
            { name: 'Ana', role: 'admin' as UserRole, companyId: 'distribuidora-norte' },
        ],
        products: [
            { id: 'CAJA-100', name: 'Pack Gaseosas', quantity: 500, location: 'Depósito 1' }
        ],
        history: []
    }
];

// Mantenemos esto para compatibilidad, pero usaremos las funciones de abajo
export const companiesDB = initialCompanies;

export const superAdmin: User = { name: 'Sebastian', role: 'admin', companyId: null };

// Funciones para guardar y leer de verdad
export const getCompanies = (): Company[] => {
    if (typeof window === 'undefined') return initialCompanies;
    
    const stored = localStorage.getItem('mirvel_companies');
    if (stored) {
        return JSON.parse(stored);
    }
    return initialCompanies;
};

export const saveCompanies = (companies: Company[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mirvel_companies', JSON.stringify(companies));
};