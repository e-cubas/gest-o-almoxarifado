
import React, { useState } from 'react';
import type { MovementSubViewType } from '../../types';
import { useWarehouseData } from '../../hooks/useWarehouseData';
import { Tabs } from '../ui/Tabs';
import { StockEntries } from '../StockEntries';
import { StockExits } from '../StockExits';
import { Tools } from '../Tools';

interface MovementViewProps {
    data: ReturnType<typeof useWarehouseData>;
}

const TABS: { id: MovementSubViewType, label: string }[] = [
    { id: 'entries', label: 'Entradas' },
    { id: 'exits', label: 'Saídas' },
    { id: 'tools', label: 'Ferramentas' },
];

export const MovementView: React.FC<MovementViewProps> = ({ data }) => {
    const [subView, setSubView] = useState<MovementSubViewType>('entries');

    const renderContent = () => {
        switch (subView) {
            case 'entries':
                return <StockEntries products={data.products} suppliers={data.suppliers} entries={data.entries} addEntry={data.addEntry} updateEntry={data.updateEntry} deleteEntry={data.deleteEntry} loading={data.loadingEntries} />;
            case 'exits':
                return <StockExits
                    products={data.products}
                    exits={data.exits}
                    entries={data.entries}
                    addExit={data.addExit}
                    updateExit={data.updateExit}
                    deleteExit={data.deleteExit}
                    returnExit={data.returnItemsFromExit}
                    getStockLevel={data.getStockLevel}
                    loading={data.loadingExits}
                />;
            case 'tools':
                return <Tools
                    tools={data.tools}
                    toolCheckouts={data.toolCheckouts}
                    addTool={data.addTool}
                    updateTool={data.updateTool}
                    deleteTool={data.deleteTool}
                    checkoutTool={data.checkoutTool}
                    returnTool={data.returnTool}
                    getCheckedOutCount={data.getCheckedOutCount}
                    loadingTools={data.loadingTools}
                    loadingCheckouts={data.loadingCheckouts}
                />;
            default:
                return null;
        }
    }

    return (
        <div>
            {/* FIX: The state setter's type is not directly assignable to onTabChange. Wrapping it in a lambda solves the type mismatch. */}
            <Tabs tabs={TABS} activeTab={subView} onTabChange={(tabId) => setSubView(tabId)} />
            {renderContent()}
        </div>
    );
};