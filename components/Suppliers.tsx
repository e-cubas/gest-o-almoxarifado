import React, { useState, useEffect, useMemo } from 'react';
import type { Supplier } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Plus, Loader2 } from 'lucide-react';
import { DataTable, Column } from './common/DataTable';
import { ActionButtons } from './common/ActionButtons';

interface SuppliersProps {
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<Supplier | undefined>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  loading?: boolean;
}

export const Suppliers: React.FC<SuppliersProps> = ({
  suppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  loading: dataLoading
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState({
    name: '',
    contact: '',
    phone: '',
    observations: '',
  });

  useEffect(() => {
    if (editingSupplier) {
      setFormState({
        name: editingSupplier.name,
        contact: editingSupplier.contact || '',
        phone: editingSupplier.phone || '',
        observations: editingSupplier.observations || '',
      });
    } else {
      setFormState({ name: '', contact: '', phone: '', observations: '' });
    }
  }, [editingSupplier]);

  const handleOpenModal = (supplier: Supplier | null = null) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setEditingSupplier(null);
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name) {
      alert('O nome do fornecedor é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSupplier) {
        await updateSupplier({ ...editingSupplier, ...formState });
      } else {
        await addSupplier(formState);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Erro ao salvar fornecedor. Verifique sua conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      await deleteSupplier(id);
    }
  }

  const columns: Column<Supplier>[] = useMemo(() => [
    {
      header: 'Nome',
      accessor: 'name',
      render: (supplier) => <span className="font-medium text-slate-900 dark:text-white">{supplier.name}</span>,
    },
    {
      header: 'Contato',
      accessor: 'contact',
      render: (supplier) => <span className="text-slate-500 dark:text-slate-400">{supplier.contact || '-'}</span>,
    },
    {
      header: 'Telefone',
      accessor: 'phone',
      render: (supplier) => <span className="text-slate-500 dark:text-slate-400">{supplier.phone || '-'}</span>,
    },
    {
      header: 'Ações',
      align: 'right',
      render: (supplier) => (
        <ActionButtons
          onEdit={() => handleOpenModal(supplier)}
          onDelete={() => handleDelete(supplier.id)}
        />
      ),
    },
  ], []);

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSupplier ? "Editar Fornecedor" : "Adicionar Novo Fornecedor"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Nome</label>
              <Input name="name" type="text" value={formState.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Telefone</label>
              <Input name="phone" type="text" value={formState.phone} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Contato</label>
              <Input name="contact" type="text" value={formState.contact} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Observações</label>
              <Input name="observations" type="text" value={formState.observations} onChange={handleChange} />
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
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Fornecedores Cadastrados</h3>
          <Button onClick={() => handleOpenModal()} disabled={dataLoading}>
            <Plus size={16} className="mr-2" /> Adicionar Fornecedor
          </Button>
        </div>

        {dataLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <DataTable
            data={suppliers}
            columns={columns}
            keyExtractor={(supplier) => supplier.id}
          />
        )}
      </Card>
    </>
  );
};

