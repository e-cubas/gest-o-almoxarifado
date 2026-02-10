
import React, { useState, useMemo, useEffect } from 'react';
import type { StockExit, Product, StockEntry } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { calculateAverageValue } from '../utils/calculations';
import { parseLocalDate } from '../utils/format';

interface CostReportProps {
  exits: StockExit[];
  products: Product[];
  entries: StockEntry[];
}

export const CostReport: React.FC<CostReportProps> = ({ exits, products, entries }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Read from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const de = params.get('de');
    const ate = params.get('ate');
    if (de) setStartDate(de);
    if (ate) setEndDate(ate);
  }, []);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (startDate) {
      params.set('de', startDate);
    } else {
      params.delete('de');
    }

    if (endDate) {
      params.set('ate', endDate);
    } else {
      params.delete('ate');
    }

    const newSearch = params.toString();
    const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [startDate, endDate]);

  const getProduct = (id: string) => products.find(p => p.id === id);

  const filteredExits = useMemo(() => {
    return exits.filter(exit => {
      const exitTime = exit.date.getTime();
      const startTime = startDate ? parseLocalDate(startDate).getTime() : 0;
      const endTime = endDate ? parseLocalDate(endDate).setHours(23, 59, 59, 999) : Infinity;
      return exitTime >= startTime && exitTime <= endTime;
    });
  }, [exits, startDate, endDate]);

  const getReturnedQuantity = (exitId: string) => {
    return entries
      .filter(entry => entry.exitId === exitId && entry.supplierId === 'DEVOLUCAO')
      .reduce((sum, entry) => sum + entry.quantity, 0);
  };

  const reportData = useMemo(() => {
    const aggregation: { [key: string]: { totalCost: number } } = {};

    filteredExits.forEach(exit => {
      const product = getProduct(exit.productId);
      if (!product) return;

      const returnedQuantity = getReturnedQuantity(exit.id);
      const effectiveQuantity = exit.quantity - returnedQuantity; // Use decimal effective quantity

      if (effectiveQuantity <= 0) return;

      const averageValue = calculateAverageValue(entries, exit.productId);
      const cost = effectiveQuantity * averageValue;
      const key = exit.destination;

      if (!aggregation[key]) {
        aggregation[key] = { totalCost: 0 };
      }

      aggregation[key].totalCost += cost;
    });

    return Object.entries(aggregation).map(([name, data]) => ({
      name,
      totalCost: data.totalCost,
    })).sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredExits, products, entries]);

  const totalCostOfReport = useMemo(() => {
    return reportData.reduce((sum, item) => sum + item.totalCost, 0);
  }, [reportData]);

  return (
    <Card>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg mb-6">
        <h4 className="text-md font-semibold mb-2">Filtrar por Período</h4>
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="text-sm">De:</label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Até:</label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Destino</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Valor Consumido (R$)</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
            {reportData.map(row => (
              <tr key={row.name}>
                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{row.name}</td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">R$ {row.totalCost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <td className="px-6 py-3 text-right text-sm font-bold text-slate-700 dark:text-slate-200">TOTAL GERAL</td>
              <td className="px-6 py-3 text-right text-sm font-bold text-slate-900 dark:text-white">R$ {totalCostOfReport.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
};