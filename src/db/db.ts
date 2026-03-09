import Dexie, { Table } from 'dexie';

export interface Product {
  id?: number;
  barcode: string;
  article: string;
  name: string;
  color: string;
  meters_per_roll: number;
  companyId: string;
}

export interface Scan {
  id?: number;
  barcode: string;
  timestamp: Date;
  product_name: string;
  meters: number;
  userName: string;
  companyId: string;
}

class InventoryDatabase extends Dexie {
  products!: Table<Product>;
  scans!: Table<Scan>;

  constructor() {
    super('WarehouseDB');
    // IMPORTANTE: Al cambiar la estructura, incrementamos la versión.
    // Si la app no funciona, puede que necesites borrar los datos de la web en el navegador.
    // (Herramientas de desarrollador -> Aplicación -> Almacenamiento -> Borrar datos del sitio)
    this.version(3).stores({
      products: '++id, &[barcode+companyId], article, name, companyId', // barcode es único POR empresa
      scans: '++id, barcode, timestamp, userName, companyId'
    });
  }
}

export const db = new InventoryDatabase();

// Seed inicial para pruebas
export const seedDatabase = async () => {
  const count = await db.products.count();
  if (count === 0) {
    await db.products.bulkAdd([
      // Datos de prueba para la Empresa A
      { barcode: "123456", article: "T-001", name: "Algodón Premium", color: "Blanco", meters_per_roll: 50, companyId: "empresa_A" },
      { barcode: "789012", article: "P-200", name: "Poliéster Ind.", color: "Azul Marino", meters_per_roll: 100, companyId: "empresa_A" },
      // Datos de prueba para la Empresa B
      { barcode: "111222", article: "L-50", name: "Lino Fino", color: "Beige", meters_per_roll: 30, companyId: "empresa_B" },
    ]);
  }
};