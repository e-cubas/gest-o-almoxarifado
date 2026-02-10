import React, { useState, useMemo } from 'react';
import type { Product, StockExit, StockEntry } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Plus, Undo2, Loader2 } from 'lucide-react';
import { DataTable, Column } from './common/DataTable';
import { ActionButtons } from './common/ActionButtons';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/format';
import { calculateAverageValue, calculateTotalValue } from '../utils/calculations';

interface StockExitsProps {
  products: Product[];
  exits: StockExit[];
  entries: StockEntry[];
  addExit: (exit: Omit<StockExit, 'id'>) => Promise<StockExit | undefined>;
  deleteExit: (id: string) => Promise<void>;
  returnExit: (exit: StockExit, quantity: number, observation: string) => Promise<void>;
  getStockLevel: (productId: string) => number;
  loading?: boolean;
}

const initialExitFormState = {
  date: new Date(),
  productId: '',
  quantity: '',
  destination: '',
  withdrawnBy: '',
  user: 'Admin', // Hardcoded for now
};

const initialReturnFormState = {
  quantity: '',
  observation: '',
};

export const StockExits: React.FC<StockExitsProps> = ({
  products,
  exits,
  entries,
  addExit,
  deleteExit,
  returnExit,
  getStockLevel,
  loading: dataLoading
}) => {
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedExit, setSelectedExit] = useState<StockExit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [exitFormState, setExitFormState] = useState(initialExitFormState);
  const [returnFormState, setReturnFormState] = useState(initialReturnFormState);

  const getProductName = (id: string) => products.find(p => p.id === id)?.description || 'N/A';

  const exitsWithReturnData = useMemo(() => {
    return exits.map(exit => {
      const returnedQuantity = entries
        .filter(entry => entry.exitId === exit.id && entry.supplierId === 'DEVOLUCAO')
        .reduce((sum, entry) => sum + entry.quantity, 0);
      const effectiveQuantity = exit.quantity - returnedQuantity;
      return {
        ...exit,
        returnedQuantity,
        effectiveQuantity,
        isFullyReturned: effectiveQuantity <= 0,
      };
    });
  }, [exits, entries]);

  const handleExitFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'quantity') {
      if (/^[\d,.]*$/.test(value)) {
        setExitFormState(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    setExitFormState(prev => ({
      ...prev,
      [name]: type === 'date' ? new Date(value) : value,
    }));
  };

  const handleExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantityNum = parseFloat(exitFormState.quantity.replace(',', '.'));

    if (!exitFormState.productId || !exitFormState.destination || isNaN(quantityNum) || quantityNum <= 0 || !exitFormState.withdrawnBy) {
      alert('Todos os campos são obrigatórios e a quantidade deve ser maior que zero.');
      return;
    }
    const currentStock = getStockLevel(exitFormState.productId);
    if (quantityNum > currentStock) {
      alert(`Saldo insuficiente. Saldo atual: ${currentStock}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await addExit({
        ...exitFormState,
        quantity: quantityNum
      });
      setExitFormState(initialExitFormState);
      setIsExitModalOpen(false);
    } catch (error) {
      console.error('Exit error:', error);
      alert('Erro ao registrar saída.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReturnModal = (exit: (typeof exitsWithReturnData)[0]) => {
    setSelectedExit(exit);
    setReturnFormState({
      quantity: exit.effectiveQuantity.toString().replace('.', ','),
      observation: ''
    });
    setIsReturnModalOpen(true);
  };

  const handleCloseReturnModal = () => {
    if (isSubmitting) return;
    setIsReturnModalOpen(false);
    setSelectedExit(null);
    setReturnFormState(initialReturnFormState);
  }

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantityNum = parseFloat(returnFormState.quantity.replace(',', '.'));

    if (!selectedExit || isNaN(quantityNum) || quantityNum <= 0) return;
    const originalExitData = exitsWithReturnData.find(ex => ex.id === selectedExit.id);
    if (!originalExitData || quantityNum > originalExitData.effectiveQuantity) {
      alert(`Quantidade de devolução inválida. Máximo: ${originalExitData?.effectiveQuantity}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await returnExit(selectedExit, quantityNum, returnFormState.observation);
      handleCloseReturnModal();
    } catch (error) {
      console.error('Return error:', error);
      alert('Erro ao devolver material.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de saída? Esta ação não pode ser desfeita e pode afetar a precisão do estoque se houver devoluções associadas.')) {
      await deleteExit(id);
    }
  };

  const columns: Column<typeof exitsWithReturnData[0]>[] = useMemo(() => [
    {
      header: 'Data',
      accessor: 'date',
      render: (exit) => <span className="text-sm text-slate-500">{formatDate(exit.date)}</span>,
    },
    {
      header: 'Produto',
      render: (exit) => (
        <>
          <div className="font-medium text-slate-900 dark:text-white">{getProductName(exit.productId)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{exit.destination}</div>
        </>
      ),
    },
    {
      header: 'Qtd',
      accessor: 'quantity',
      render: (exit) => (
        <span className="text-sm text-slate-500">
          {exit.effectiveQuantity}
          {exit.returnedQuantity > 0 && (
            <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">({exit.returnedQuantity} devolvido)</span>
          )}
        </span>
      ),
    },
    {
      header: 'Valor Médio',
      render: (exit) => {
        const averageValue = calculateAverageValue(entries, exit.productId);
        const totalValue = calculateTotalValue(exit.effectiveQuantity, averageValue);
        return (
          <div className="text-slate-800 dark:text-slate-300">
            <div className="font-semibold">{formatCurrency(averageValue)}</div>
            <div className="text-xs text-slate-500 font-normal">Total: {formatCurrency(totalValue)}</div>
          </div>
        );
      },
    },
    {
      header: 'Retirado por',
      accessor: 'withdrawnBy',
    },
    {
      header: 'Ações',
      align: 'right',
      render: (exit) => (
        <ActionButtons
          onDelete={() => handleDelete(exit.id)}
          customActions={
            !exit.isFullyReturned ? (
              <button
                onClick={() => handleOpenReturnModal(exit)}
                title="Devolver ao estoque"
                className="text-emerald-500 hover:text-emerald-700 p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <Undo2 size={16} />
              </button>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                Devolvido
              </span>
            )
          }
        />
      ),
    },
  ], [entries, products]);

  // Sort exits by date descending
  const sortedExits = useMemo(() => {
    return [...exitsWithReturnData].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [exitsWithReturnData]);

  return (
    <>
      <Modal isOpen={isExitModalOpen} onClose={() => !isSubmitting && setIsExitModalOpen(false)} title="Registrar Saída de Material">
        <form onSubmit={handleExitSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Produto</label>
              <select name="productId" value={exitFormState.productId} onChange={handleExitFormChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" required>
                <option value="">Selecione...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.description} (Saldo: {getStockLevel(p.id)})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Quantidade</label>
              <Input name="quantity" type="text" inputMode="decimal" placeholder="0,00" value={exitFormState.quantity} onChange={handleExitFormChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Data</label>
              <Input name="date" type="date" value={formatDateForInput(exitFormState.date)} onChange={handleExitFormChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Nome de quem retirou</label>
              <Input name="withdrawnBy" type="text" placeholder="Ex: João Silva" value={exitFormState.withdrawnBy} onChange={handleExitFormChange} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Setor / Nome do Destino</label>
              <Input name="destination" type="text" placeholder="Ex: Administração, Caminhão-01, Setor Elétrico" value={exitFormState.destination} onChange={handleExitFormChange} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsExitModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" /> Salvando...</> : 'Registrar Saída'}
            </Button>
          </div>
        </form>
      </Modal>

      {selectedExit && (
        <Modal isOpen={isReturnModalOpen} onClose={handleCloseReturnModal} title="Devolver Material ao Estoque">
          <form onSubmit={handleReturnSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Produto</label>
              <Input type="text" value={getProductName(selectedExit.productId)} readOnly className="bg-slate-100 dark:bg-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium">Quantidade a Devolver</label>
              <Input
                name="quantity"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={returnFormState.quantity}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[\d,.]*$/.test(val)) {
                    setReturnFormState(prev => ({ ...prev, quantity: val }));
                  }
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Observação (Opcional)</label>
              <Input
                name="observation"
                type="text"
                placeholder="Ex: Devolução parcial"
                value={returnFormState.observation}
                onChange={(e) => setReturnFormState(prev => ({ ...prev, observation: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCloseReturnModal} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" /> Salvando...</> : 'Confirmar Devolução'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Histórico de Saídas</h3>
          <Button onClick={() => setIsExitModalOpen(true)} disabled={dataLoading}>
            <Plus size={16} className="mr-2" /> Registrar Saída
          </Button>
        </div>

        {dataLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <DataTable
            data={sortedExits}
            columns={columns}
            keyExtractor={(exit) => exit.id}
            rowClassName={(exit) => exit.isFullyReturned ? 'opacity-60' : ''}
          />
        )}
      </Card>
    </>
  );
};