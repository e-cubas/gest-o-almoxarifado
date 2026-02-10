import React, { useState, useMemo } from 'react';
import type { Product } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Search, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { DataTable, Column } from './common/DataTable';

interface StockControlProps {
  products: Product[];
  getStockLevel: (productId: string) => number;
  loading?: boolean;
}

const StockStatus: React.FC<{ current: number; min: number }> = ({ current, min }) => {
  if (current < min) {
    return (
      <span className="flex items-center text-xs font-semibold text-red-500">
        <AlertCircle className="w-4 h-4 mr-1.5" />
        Abaixo do Mínimo
      </span>
    );
  }
  return (
    <span className="flex items-center text-xs font-semibold text-emerald-500">
      <CheckCircle className="w-4 h-4 mr-1.5" />
      Normal
    </span>
  );
};

export const StockControl: React.FC<StockControlProps> = ({ products, getStockLevel, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const stockData = useMemo(() => {
    return products.map(p => ({
      ...p,
      currentStock: getStockLevel(p.id),
    })).filter(p =>
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, getStockLevel, searchTerm]);

  const columns: Column<typeof stockData[0]>[] = useMemo(() => [
    {
      header: 'Código',
      accessor: 'id',
      render: (p) => <span className="text-sm font-mono text-slate-500 dark:text-slate-400" title={p.id}>{p.id.slice(0, 8)}...</span>,
    },
    {
      header: 'Descrição',
      accessor: 'description',
      render: (p) => <span className="font-medium text-slate-900 dark:text-white">{p.description}</span>,
    },
    {
      header: 'Saldo Atual',
      accessor: 'currentStock',
      align: 'center',
      render: (p) => <span className="font-bold text-slate-900 dark:text-white">{p.currentStock}</span>,
    },
    {
      header: 'Estoque Mín.',
      accessor: 'minStock',
      align: 'center',
    },
    {
      header: 'Status',
      render: (p) => <StockStatus current={p.currentStock} min={p.minStock} />,
    },
    {
      header: 'Localização',
      accessor: 'location',
      render: (p) => <span className="text-slate-500 dark:text-slate-400">{p.location || '-'}</span>,
    },
  ], []);

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Posição de Estoque</h3>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por código, descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <DataTable
          data={stockData}
          columns={columns}
          keyExtractor={(p) => p.id}
          rowClassName={(p) => p.currentStock < p.minStock ? 'bg-red-50 dark:bg-red-900/20' : ''}
        />
      )}
    </Card>
  );
};

