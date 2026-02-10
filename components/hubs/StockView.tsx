
import React, { useState } from 'react';
import type { StockSubViewType } from '../../types';
import { useWarehouseData } from '../../hooks/useWarehouseData';
import { Tabs } from '../ui/Tabs';
import { StockControl } from '../StockControl';
import { Products } from '../Products';
import { Suppliers } from '../Suppliers';

interface StockViewProps {
  data: ReturnType<typeof useWarehouseData>;
}

const TABS: { id: StockSubViewType, label: string }[] = [
  { id: 'stock-control', label: 'Controle de Estoque' },
  { id: 'products', label: 'Produtos' },
  { id: 'suppliers', label: 'Fornecedores' },
];

export const StockView: React.FC<StockViewProps> = ({ data }) => {
  const [subView, setSubView] = useState<StockSubViewType>('stock-control');

  const renderContent = () => {
    switch (subView) {
      case 'stock-control':
        return <StockControl products={data.products} getStockLevel={data.getStockLevel} loading={data.loading} />;
      case 'products':
        return <Products products={data.products} entries={data.entries} addProduct={data.addProduct} updateProduct={data.updateProduct} deleteProduct={data.deleteProduct} loading={data.loading} />;
      case 'suppliers':
        return <Suppliers suppliers={data.suppliers} addSupplier={data.addSupplier} updateSupplier={data.updateSupplier} deleteSupplier={data.deleteSupplier} loading={data.loadingSuppliers} />;
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
