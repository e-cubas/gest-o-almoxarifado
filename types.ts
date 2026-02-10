
export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  observations?: string;
}

export interface Product {
  id: string;
  description: string;
  category: string;
  unit: string;
  minStock: number;
  unitCost: number;
  location?: string;
}

export interface StockEntry {
  id: string;
  date: Date;
  productId: string;
  quantity: number;
  unitValue: number;
  supplierId: string;
  user: string; // Logged in user
  observations?: string;
  exitId?: string; // Link to original exit for returns
}

export interface StockExit {
  id: string;
  date: Date;
  productId: string;
  quantity: number;
  destination: string; // e.g., 'Administração', 'Caminhão-01', 'Retroescavadeira-A'
  withdrawnBy: string; // Name of the person who took the item
  user: string;
}

export interface Tool {
  id: string;
  description: string;
  quantity: number; // Total quantity of this tool
}

export interface ToolCheckout {
  id: string;
  toolId: string;
  responsible: string;
  checkoutDate: Date;
}


// New navigation types
export type MainViewType = 'dashboard' | 'stock' | 'movement' | 'reports';

export type StockSubViewType = 'stock-control' | 'products' | 'suppliers';
export type MovementSubViewType = 'entries' | 'exits' | 'tools';