
import React from 'react';
import { useWarehouseData } from '../../hooks/useWarehouseData';
import { CostReport } from '../CostReport';

interface ReportsViewProps {
    data: ReturnType<typeof useWarehouseData>;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ data }) => {
    return (
        <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Relatório de Consumo por Destino</h3>
            <CostReport exits={data.exits} products={data.products} entries={data.entries} />
        </div>
    );
};