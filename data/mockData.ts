
import type { Supplier, Product, StockEntry, StockExit, Tool, ToolCheckout } from '../types';

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'FORN-001', name: 'ABC Suprimentos', contact: 'Carlos', phone: '11 98765-4321' },
  { id: 'FORN-002', name: 'Ferragens Universal', contact: 'Ana', phone: '21 91234-5678' },
  { id: 'FORN-003', name: 'Escritório & Cia', contact: 'Pedro', phone: '31 95555-4444' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'PROD-001', description: 'Parafuso Sextavado 1/4"', category: 'Ferragens', unit: 'UN', minStock: 100, unitCost: 0.50, location: 'Corredor A, Prateleira 3' },
  { id: 'PROD-002', description: 'Óleo Motor 15W40', category: 'Lubrificantes', unit: 'LT', minStock: 20, unitCost: 25.00, location: 'Corredor B, Prateleira 1' },
  { id: 'PROD-003', description: 'Papel A4 (resma)', category: 'Escritório', unit: 'PCT', minStock: 10, unitCost: 18.00, location: 'Sala 1, Armário 2' },
  { id: 'PROD-004', description: 'Lâmpada LED 12W', category: 'Elétrica', unit: 'UN', minStock: 50, unitCost: 8.50, location: 'Corredor A, Prateleira 5' },
];

export const MOCK_ENTRIES: StockEntry[] = [
  { id: 'ENT-001', date: new Date('2024-05-20'), productId: 'PROD-001', quantity: 500, unitValue: 0.48, supplierId: 'FORN-002', user: 'Admin', observations: 'NF 12345' },
  { id: 'ENT-002', date: new Date('2024-05-21'), productId: 'PROD-002', quantity: 50, unitValue: 24.50, supplierId: 'FORN-001', user: 'Admin' },
  { id: 'ENT-003', date: new Date('2024-05-22'), productId: 'PROD-003', quantity: 30, unitValue: 18.00, supplierId: 'FORN-003', user: 'Admin', observations: 'Pedido #789' },
  { id: 'ENT-004', date: new Date('2024-05-23'), productId: 'PROD-001', quantity: 200, unitValue: 0.50, supplierId: 'FORN-002', user: 'Admin' },
  { id: 'ENT-005', date: new Date('2024-05-28'), productId: 'PROD-004', quantity: 100, unitValue: 8.50, supplierId: 'FORN-001', user: 'Admin', observations: 'NF 12399' },
];

export const MOCK_EXITS: StockExit[] = [
  { id: 'SAI-001', date: new Date('2024-05-25'), productId: 'PROD-001', quantity: 50, destination: 'Retroescavadeira-A', withdrawnBy: 'João Silva', user: 'Operador1' },
  { id: 'SAI-002', date: new Date('2024-05-26'), productId: 'PROD-002', quantity: 10, destination: 'Caminhão-01', withdrawnBy: 'Marcos P.', user: 'Operador2' },
  { id: 'SAI-003', date: new Date('2024-05-27'), productId: 'PROD-003', quantity: 5, destination: 'Administração', withdrawnBy: 'Ana Costa', user: 'Admin' },
  { id: 'SAI-004', date: new Date('2024-05-28'), productId: 'PROD-001', quantity: 120, destination: 'Manutenção', withdrawnBy: 'João Silva', user: 'Operador1' },
  { id: 'SAI-005', date: new Date('2024-05-29'), productId: 'PROD-002', quantity: 15, destination: 'Caminhão-02', withdrawnBy: 'Carlos Alberto', user: 'Operador2' },
  { id: 'SAI-006', date: new Date('2024-05-30'), productId: 'PROD-004', quantity: 10, destination: 'Oficina', withdrawnBy: 'Ricardo Lima', user: 'Operador1' },
];

export const MOCK_TOOLS: Tool[] = [
    { id: 'FER-001', description: 'Furadeira de Impacto Bosch', quantity: 5 },
    { id: 'FER-002', description: 'Martelete Rompedor Dewalt', quantity: 2 },
    { id: 'FER-003', description: 'Lixadeira Orbital Makita', quantity: 3 },
];

export const MOCK_TOOL_CHECKOUTS: ToolCheckout[] = [
    { id: 'COUT-001', toolId: 'FER-001', responsible: 'João Silva', checkoutDate: new Date('2024-05-29') },
    { id: 'COUT-002', toolId: 'FER-002', responsible: 'Marcos P.', checkoutDate: new Date('2024-05-28') },
    { id: 'COUT-003', toolId: 'FER-002', responsible: 'João Silva', checkoutDate: new Date('2024-05-30') },
];