import React, { useState, useEffect, useMemo } from 'react';
import type { Product, StockEntry } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Plus, Loader2 } from 'lucide-react';
import { DataTable, Column } from './common/DataTable';
import { ActionButtons } from './common/ActionButtons';
import { formatCurrency } from '../utils/format';
import { calculateAverageValue } from '../utils/calculations';

interface ProductsProps {
  products: Product[];
  entries: StockEntry[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | undefined>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  loading?: boolean;
}

const initialFormState = {
  description: '',
  category: '',
  unit: '',
  minStock: 0,
  unitCost: 0,
  location: '',
};

export const Products: React.FC<ProductsProps> = ({
  products,
  entries,
  addProduct,
  updateProduct,
  deleteProduct,
  loading: dataLoading
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormState({
        description: editingProduct.description,
        category: editingProduct.category,
        unit: editingProduct.unit,
        minStock: editingProduct.minStock,
        unitCost: editingProduct.unitCost,
        location: editingProduct.location || '',
      });
    } else {
      setFormState(initialFormState);
    }
  }, [editingProduct]);

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.description || !formState.category || !formState.unit) {
      alert('Descrição, Categoria e Unidade são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...formState });
      } else {
        await addProduct(formState);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Erro ao salvar produto. Verifique sua conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto? Isso pode afetar os registros históricos.')) {
      await deleteProduct(id);
    }
  };

  const columns: Column<Product>[] = useMemo(() => [
    {
      header: 'Descrição',
      accessor: 'description',
      render: (product) => <span className="font-medium text-slate-900 dark:text-white">{product.description}</span>,
    },
    {
      header: 'Categoria',
      accessor: 'category',
    },
    {
      header: 'Custo Médio',
      render: (product) => {
        const averageCost = calculateAverageValue(entries, product.id);
        const displayCost = averageCost > 0 ? averageCost : product.unitCost;
        return <span className="text-slate-500 dark:text-slate-400">{formatCurrency(displayCost)}</span>;
      },
    },
    {
      header: 'Ações',
      align: 'right',
      render: (product) => (
        <ActionButtons
          onEdit={() => handleOpenModal(product)}
          onDelete={() => handleDelete(product.id)}
        />
      ),
    },
  ], [entries]);

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Descrição</label>
              <Input name="description" type="text" value={formState.description} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Categoria</label>
              <Input name="category" type="text" value={formState.category} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Unidade</label>
              <Input name="unit" type="text" placeholder="Ex: UN, PCT, LT" value={formState.unit} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Localização</label>
              <Input name="location" type="text" value={formState.location} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium">Estoque Mínimo</label>
              <Input name="minStock" type="number" min="0" value={formState.minStock} onChange={handleChange} />
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Produtos Cadastrados</h3>
          <Button onClick={() => handleOpenModal()} disabled={dataLoading}>
            <Plus size={16} className="mr-2" /> Adicionar Produto
          </Button>
        </div>

        {dataLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <DataTable
            data={products}
            columns={columns}
            keyExtractor={(product) => product.id}
          />
        )}
      </Card>
    </>
  );
};

