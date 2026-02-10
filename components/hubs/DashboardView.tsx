
import React, { useMemo } from 'react';
import { useWarehouseData } from '../../hooks/useWarehouseData';
import { Card } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { DollarSign, Archive, AlertTriangle, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { calculateAverageValue } from '../../utils/calculations';

interface DashboardViewProps {
    data: ReturnType<typeof useWarehouseData>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data }) => {
    const { products, suppliers, entries, exits, toolCheckouts, getStockLevel } = data;

    const dashboardStats = useMemo(() => {
        const totalStockValue = products.reduce((sum, product) => {
            const stockLevel = getStockLevel(product.id);
            const avgValue = calculateAverageValue(entries, product.id);
            // Use average value if available (based on entries), otherwise fallback to registered unit cost
            const unitValue = avgValue > 0 ? avgValue : product.unitCost;
            return sum + (stockLevel * unitValue);
        }, 0);

        const lowStockItems = products.filter(p => getStockLevel(p.id) < p.minStock);

        const checkedOutToolsCount = toolCheckouts.length;

        const supplierCount = suppliers.length;

        return {
            totalStockValue,
            lowStockCount: lowStockItems.length,
            checkedOutToolsCount,
            supplierCount,
            lowStockItems
        }
    }, [products, suppliers, toolCheckouts, getStockLevel]);

    const recentActivity = useMemo(() => {
        const combined = [
            ...entries.map(e => ({ ...e, type: 'entry' as const })),
            ...exits.map(e => ({ ...e, type: 'exit' as const }))
        ];
        return combined.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    }, [entries, exits]);

    const getProductName = (id: string) => products.find(p => p.id === id)?.description || 'N/A';

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={DollarSign}
                    title="Valor Total em Estoque"
                    value={`R$ ${dashboardStats.totalStockValue.toFixed(2)}`}
                    iconColorClass="text-emerald-500"
                />
                <StatCard
                    icon={Archive}
                    title="Itens com Estoque Baixo"
                    value={dashboardStats.lowStockCount}
                    iconColorClass="text-amber-500"
                />
                <StatCard
                    icon={AlertTriangle}
                    title="Ferramentas em Uso"
                    value={dashboardStats.checkedOutToolsCount}
                    iconColorClass="text-red-500"
                />
                <StatCard
                    icon={Users}
                    title="Fornecedores Ativos"
                    value={dashboardStats.supplierCount}
                    iconColorClass="text-sky-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <Card className="lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {recentActivity.map(item => (
                            <li key={item.id} className="py-3 flex items-start">
                                <div className={`mr-3 p-1.5 rounded-full ${item.type === 'entry' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                                    {item.type === 'entry' ?
                                        <ArrowRight className="w-4 h-4 text-emerald-500" /> :
                                        <ArrowLeft className="w-4 h-4 text-red-500" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{getProductName(item.productId)}</p>
                                    <p className="text-xs text-slate-500">
                                        {item.quantity} unidades • {item.date.toLocaleDateString()}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
                {/* Low Stock Items */}
                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Itens com Estoque Baixo</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Produto</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">Saldo</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">Mínimo</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                                {dashboardStats.lowStockItems.length > 0 ? dashboardStats.lowStockItems.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-3 text-sm font-medium">{p.description}</td>
                                        <td className="px-4 py-3 text-sm text-center font-bold text-red-500">{getStockLevel(p.id)}</td>
                                        <td className="px-4 py-3 text-sm text-center">{p.minStock}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-slate-500">Nenhum item com estoque baixo.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};
