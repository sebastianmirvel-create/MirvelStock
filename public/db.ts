import Dexie, { Table } from 'dexie';

export interface Product {
  id?: number;
  barcode: string;
  article: string;
  name: string;
  color: string;
  meters_per_roll: number;
}

export interface Scan {
  id?: number;
  barcode: string;
  timestamp: Date;
  product_name: string;
  meters: number;
}

class InventoryDatabase extends Dexie {
  products!: Table<Product>;
  scans!: Table<Scan>;

  constructor() {
    super('WarehouseDB');
    this.version(1).stores({
      products: '++id, &barcode, article, name', // &barcode = único
      scans: '++id, barcode, timestamp'
    });
  }
}

export const db = new InventoryDatabase();

// Seed inicial para pruebas
export const seedDatabase = async () => {
  const count = await db.products.count();
  if (count === 0) {
    await db.products.bulkAdd([
      { barcode: "123456", article: "T-001", name: "Algodón Premium", color: "Blanco", meters_per_roll: 50 },
      { barcode: "789012", article: "P-200", name: "Poliéster Ind.", color: "Azul Marino", meters_per_roll: 100 },
      { barcode: "111222", article: "L-50", name: "Lino Fino", color: "Beige", meters_per_roll: 30 },
    ]);
  }
};