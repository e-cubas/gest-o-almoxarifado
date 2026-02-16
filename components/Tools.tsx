import React, { useState, useMemo, useEffect } from 'react';
import type { Tool, ToolCheckout } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Plus, ArrowUpRightFromSquare, CornerDownLeft, Loader2, Search } from 'lucide-react';
import { DataTable, Column } from './common/DataTable';
import { ActionButtons } from './common/ActionButtons';
import { formatDate } from '../utils/format';

interface ToolsProps {
    tools: Tool[];
    toolCheckouts: ToolCheckout[];
    addTool: (tool: Omit<Tool, 'id'>) => Promise<Tool | undefined>;
    updateTool: (tool: Tool) => Promise<void>;
    deleteTool: (id: string) => Promise<void>;
    checkoutTool: (toolId: string, responsible: string, quantity: number) => Promise<void>;
    returnTool: (checkoutId: string) => Promise<void>;
    getCheckedOutCount: (toolId: string) => number;
    loadingTools?: boolean;
    loadingCheckouts?: boolean;
}

export const Tools: React.FC<ToolsProps> = (props) => {
    const {
        tools,
        toolCheckouts,
        addTool,
        updateTool,
        deleteTool,
        checkoutTool,
        returnTool,
        getCheckedOutCount,
        loadingTools,
        loadingCheckouts
    } = props;

    // State for modals
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // State for selected tool and forms
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const [addEditForm, setAddEditForm] = useState({ description: '', quantity: 1 });
    const [checkoutForm, setCheckoutForm] = useState({ responsible: '', quantity: 1 });

    useEffect(() => {
        if (selectedTool) {
            setAddEditForm({ description: selectedTool.description, quantity: selectedTool.quantity });
        } else {
            setAddEditForm({ description: '', quantity: 1 });
        }
    }, [selectedTool]);

    // Modal Handlers
    const openAddEditModal = (tool: Tool | null = null) => {
        setSelectedTool(tool);
        setIsAddEditModalOpen(true);
    };
    const openCheckoutModal = (tool: Tool) => {
        setSelectedTool(tool);
        setIsCheckoutModalOpen(true);
    };
    const openReturnModal = (tool: Tool) => {
        setSelectedTool(tool);
        setIsReturnModalOpen(true);
    };
    const closeModal = () => {
        if (isSubmitting) return;
        setIsAddEditModalOpen(false);
        setIsCheckoutModalOpen(false);
        setIsReturnModalOpen(false);
        setSelectedTool(null);
        setAddEditForm({ description: '', quantity: 1 });
        setCheckoutForm({ responsible: '', quantity: 1 });
    };

    // Form Handlers
    const handleAddEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addEditForm.description || addEditForm.quantity < 0) return;

        setIsSubmitting(true);
        try {
            if (selectedTool) {
                await updateTool({ ...selectedTool, ...addEditForm });
            } else {
                await addTool(addEditForm);
            }
            closeModal();
        } catch (error) {
            console.error('Error saving tool:', error);
            alert('Erro ao salvar ferramenta.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTool && checkoutForm.responsible && checkoutForm.quantity > 0) {
            setIsSubmitting(true);
            try {
                await checkoutTool(selectedTool.id, checkoutForm.responsible, checkoutForm.quantity);
                closeModal();
            } catch (error) {
                console.error('Checkout error:', error);
                alert('Erro ao retirar ferramenta.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta ferramenta?')) {
            await deleteTool(id);
        }
    };

    const handleReturn = async (checkoutId: string) => {
        setIsSubmitting(true);
        try {
            await returnTool(checkoutId);
        } catch (error) {
            console.error('Return error:', error);
            alert('Erro ao devolver ferramenta.');
        } finally {
            setIsSubmitting(false);
        }
    }

    const activeCheckoutsForSelectedTool = useMemo(() => {
        return selectedTool ? toolCheckouts.filter(c => c.toolId === selectedTool.id) : [];
    }, [selectedTool, toolCheckouts]);

    const columns: Column<Tool>[] = useMemo(() => [
        {
            header: 'Descrição',
            render: (tool) => {
                const checkoutsForThisTool = toolCheckouts.filter(c => c.toolId === tool.id);
                const responsibles: Record<string, number> = checkoutsForThisTool.reduce((acc, checkout) => {
                    acc[checkout.responsible] = (acc[checkout.responsible] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                return (
                    <>
                        <div className="font-medium text-slate-900 dark:text-white">{tool.description}</div>
                        {Object.entries(responsibles).map(([name, count]) => (
                            <div key={name} className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Responsável: {name} {count > 1 ? `(x${count})` : ''}
                            </div>
                        ))}
                    </>
                );
            }
        },
        {
            header: 'Qtd. Total',
            accessor: 'quantity',
            align: 'center',
        },
        {
            header: 'Disponível',
            align: 'center',
            render: (tool) => {
                const inUseCount = getCheckedOutCount(tool.id);
                const availableCount = tool.quantity - inUseCount;
                return <span className="font-bold text-emerald-600 dark:text-emerald-400">{availableCount}</span>;
            }
        },
        {
            header: 'Em Uso',
            align: 'center',
            render: (tool) => {
                const inUseCount = getCheckedOutCount(tool.id);
                return <span className="font-bold text-amber-600 dark:text-amber-400">{inUseCount}</span>;
            }
        },
        {
            header: 'Ações',
            align: 'right',
            render: (tool) => {
                const inUseCount = getCheckedOutCount(tool.id);
                const availableCount = tool.quantity - inUseCount;
                return (
                    <ActionButtons
                        onEdit={() => openAddEditModal(tool)}
                        onDelete={() => handleDelete(tool.id)}
                        customActions={
                            <>
                                <Button variant="secondary" size="sm" onClick={() => openCheckoutModal(tool)} disabled={availableCount === 0 || loadingTools || loadingCheckouts} className="mr-2">
                                    <ArrowUpRightFromSquare size={14} className="mr-1.5" /> Retirar
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => openReturnModal(tool)} disabled={inUseCount === 0 || loadingTools || loadingCheckouts} className="mr-2">
                                    <CornerDownLeft size={14} className="mr-1.5" /> Devolver
                                </Button>
                            </>
                        }
                    />
                );
            }
        }
    ], [toolCheckouts, getCheckedOutCount, loadingTools, loadingCheckouts]);

    // Filter tools
    const filteredTools = useMemo(() => {
        if (!searchTerm) return tools;

        const term = searchTerm.toLowerCase();
        return tools.filter(tool => {
            const description = tool.description.toLowerCase();
            const hasResponsibleMatch = toolCheckouts
                .filter(c => c.toolId === tool.id)
                .some(c => c.responsible.toLowerCase().includes(term));

            return description.includes(term) || hasResponsibleMatch;
        });
    }, [tools, searchTerm, toolCheckouts]);

    return (
        <div className="space-y-6">
            {/* Add/Edit Modal */}
            <Modal isOpen={isAddEditModalOpen} onClose={closeModal} title={selectedTool ? 'Editar Ferramenta' : 'Adicionar Ferramenta'}>
                <form onSubmit={handleAddEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Descrição</label>
                        <Input type="text" value={addEditForm.description} onChange={(e) => setAddEditForm(f => ({ ...f, description: e.target.value }))} required disabled={isSubmitting} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Quantidade Total</label>
                        <Input type="number" min="0" value={addEditForm.quantity} onChange={(e) => setAddEditForm(f => ({ ...f, quantity: parseInt(e.target.value, 10) || 0 }))} required disabled={isSubmitting} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" type="button" onClick={closeModal} disabled={isSubmitting}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" /> Salvando...</> : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Checkout Modal */}
            {selectedTool && (
                <Modal isOpen={isCheckoutModalOpen} onClose={closeModal} title={`Retirar: ${selectedTool.description}`}>
                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Nome do Responsável</label>
                            <Input type="text" value={checkoutForm.responsible} onChange={e => setCheckoutForm(f => ({ ...f, responsible: e.target.value }))} required disabled={isSubmitting} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Quantidade</label>
                            <Input type="number" min="1" max={selectedTool.quantity - getCheckedOutCount(selectedTool.id)} value={checkoutForm.quantity} onChange={e => setCheckoutForm(f => ({ ...f, quantity: parseInt(e.target.value, 10) || 1 }))} required disabled={isSubmitting} />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="secondary" type="button" onClick={closeModal} disabled={isSubmitting}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" /> Processando...</> : 'Confirmar Retirada'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Return Modal */}
            {selectedTool && (
                <Modal isOpen={isReturnModalOpen} onClose={closeModal} title={`Devolver: ${selectedTool.description}`}>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        <h4 className="text-md font-semibold">Selecione a retirada para devolver:</h4>
                        {activeCheckoutsForSelectedTool.length > 0 ? (
                            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                {activeCheckoutsForSelectedTool.map(c => (
                                    <li key={c.id} className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="font-medium">{c.responsible}</p>
                                            <p className="text-sm text-slate-500">Retirado em: {formatDate(c.checkoutDate)}</p>
                                        </div>
                                        <Button size="sm" variant="secondary" onClick={() => handleReturn(c.id)} disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Devolver'}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-slate-500 text-center py-4">Nenhuma unidade desta ferramenta em uso.</p>}
                    </div>
                </Modal>
            )}

            <Card>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Controle de Ferramentas</h3>
                    <div className="flex flex-col md:flex-row w-full md:w-auto gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                type="text"
                                placeholder="Buscar ferramenta..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={() => openAddEditModal()} disabled={loadingTools || loadingCheckouts}>
                            <Plus size={16} className="mr-2" /> Adicionar Ferramenta
                        </Button>
                    </div>
                </div>

                {loadingTools || loadingCheckouts ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <DataTable
                        data={filteredTools}
                        columns={columns}
                        keyExtractor={(tool) => tool.id}
                    />
                )}
            </Card>
        </div>
    );
};