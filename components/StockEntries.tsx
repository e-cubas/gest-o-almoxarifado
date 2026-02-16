import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Supplier, StockEntry } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Plus, Loader2, Search } from 'lucide-react';
import { DataTable, Column } from './common/DataTable';
import { ActionButtons } from './common/ActionButtons';
import { formatCurrency, formatDate, formatDateForInput, parseLocalDate } from '../utils/format';
import { calculateTotalValue } from '../utils/calculations';

interface StockEntriesProps {
  products: Product[];
  suppliers: Supplier[];
  entries: StockEntry[];
  addEntry: (entry: Omit<StockEntry, 'id'>) => Promise<StockEntry | undefined>;
  updateEntry: (entry: StockEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  loading?: boolean;
}

const initialFormState = {
  date: new Date(),
  productId: '',
  quantity: '',
  unitValue: 0,
  supplierId: '',
  user: 'Admin', // Hardcoded for now
  observations: '',
};

export const StockEntries: React.FC<StockEntriesProps> = ({
  products,
  suppliers,
  entries,
  addEntry,
  updateEntry,
  deleteEntry,
  loading: dataLoading
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (editingEntry) {
      setFormState({
        date: editingEntry.date,
        productId: editingEntry.productId,
        quantity: editingEntry.quantity.toString().replace('.', ','),
        unitValue: editingEntry.unitValue,
        supplierId: editingEntry.supplierId,
        user: editingEntry.user,
        observations: editingEntry.observations || '',
      });
    } else {
      setFormState(initialFormState);
    }
  }, [editingEntry]);

  const handleOpenModal = (entry: StockEntry | null = null) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'quantity') {
      if (/^[\d,.]*$/.test(value)) {
        setFormState(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    setFormState(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : type === 'date' ? parseLocalDate(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantityNum = parseFloat(formState.quantity.toString().replace(',', '.'));

    if (!formState.productId || !formState.supplierId || isNaN(quantityNum) || quantityNum <= 0) {
      alert('Produto, Fornecedor e Quantidade são obrigatórios e a quantidade deve ser maior que zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formState,
        quantity: quantityNum,
      };

      if (editingEntry) {
        await updateEntry({ ...editingEntry, ...dataToSubmit });
      } else {
        await addEntry(dataToSubmit);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Erro ao salvar entrada. Verifique sua conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de entrada? Esta ação não pode ser desfeita.')) {
      await deleteEntry(id);
    }
  };

  const getProductName = (id: string) => products.find(p => p.id === id)?.description || 'N/A';
  const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || (id === 'DEVOLUCAO' ? 'Devolução' : 'N/A');

  const columns: Column<StockEntry>[] = useMemo(() => [
    {
      header: 'Data',
      accessor: 'date',
      render: (entry) => <span className="text-sm text-slate-500">{formatDate(entry.date)}</span>,
    },
    {
      header: 'Produto',
      render: (entry) => (
        <>
          <div className="font-medium text-slate-900 dark:text-white">{getProductName(entry.productId)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{getSupplierName(entry.supplierId)}</div>
          {entry.observations && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{entry.observations}</div>
          )}
        </>
      ),
    },
    {
      header: 'Qtd',
      accessor: 'quantity',
      render: (entry) => <span className="text-sm text-slate-500">{entry.quantity}</span>,
    },
    {
      header: 'Valor Unitário',
      render: (entry) => (
        <div className="text-slate-800 dark:text-slate-300">
          <div>{formatCurrency(entry.unitValue)}</div>
          <div className="text-xs text-slate-500 font-normal">Total: {formatCurrency(calculateTotalValue(entry.quantity, entry.unitValue))}</div>
        </div>
      ),
    },
    {
      header: 'Ações',
      align: 'right',
      render: (entry) => (
        <ActionButtons
          onEdit={() => handleOpenModal(entry)}
          onDelete={() => handleDelete(entry.id)}
        />
      ),
    },
  ], [products, suppliers]);

  // Filter and Sort entries
  const processedEntries = useMemo(() => {
    let filtered = [...entries];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => {
        const product = getProductName(entry.productId).toLowerCase();
        const supplier = getSupplierName(entry.supplierId).toLowerCase();
        const obs = (entry.observations || '').toLowerCase();
        return product.includes(term) || supplier.includes(term) || obs.includes(term);
      });
    }

    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entries, searchTerm, products, suppliers]);

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEntry ? "Editar Entrada" : "Registrar Entrada de Material"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Produto</label>
              <select name="productId" value={formState.productId} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" required>
                <option value="">Selecione...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.description}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Fornecedor</label>
              <select name="supplierId" value={formState.supplierId} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" required>
                <option value="">Selecione...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                <option value="DEVOLUCAO">Devolução de Material</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Data</label>
              <Input name="date" type="date" value={formatDateForInput(formState.date)} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Quantidade</label>
              <Input name="quantity" type="text" inputMode="decimal" placeholder="0,00" value={formState.quantity} onChange={handleChange} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Valor Unitário</label>
              <Input name="unitValue" type="number" step="0.01" min="0" value={formState.unitValue} onChange={handleChange} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Obs (NF, Pedido, etc.)</label>
              <Input name="observations" type="text" value={formState.observations || ''} onChange={handleChange} placeholder="Opcional" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" /> Salvando...</> : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Histórico de Entradas</h3>
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                type="text"
                placeholder="Buscar entrada..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleOpenModal()} disabled={dataLoading}>
              <Plus size={16} className="mr-2" /> Registrar Entrada
            </Button>
          </div>
        </div>

        {dataLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <DataTable
            data={processedEntries}
            columns={columns}
            keyExtractor={(entry) => entry.id}
          />
        )}
      </Card>
    </>
  );
};