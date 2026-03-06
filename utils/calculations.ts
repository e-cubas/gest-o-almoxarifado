import type { StockEntry } from '../types';

/**
 * Calculate the weighted average value of a product based on its entries.
 * Formula: Sum(Quantity * UnitValue) / Sum(Quantity)
 * @param entries The list of all stock entries.
 * @param productId The ID of the product to calculate.
 * @returns The weighted average value, or 0 if no entries exist.
 */
export const calculateAverageValue = (entries: StockEntry[], productId: string, beforeDate?: Date): number => {
    let productEntries = entries.filter(e => e.productId === productId);

    if (beforeDate) {
        productEntries = productEntries.filter(e => e.date <= beforeDate);
    }

    if (productEntries.length === 0) return 0;

    const totalValue = productEntries.reduce((sum, e) => sum + (e.quantity * e.unitValue), 0);
    const totalQuantity = productEntries.reduce((sum, e) => sum + e.quantity, 0);

    return totalQuantity === 0 ? 0 : totalValue / totalQuantity;
};

/**
 * Calculate the total value (Quantity * Unit Value).
 * @param quantity The quantity.
 * @param unitValue The unit value.
 * @returns The total value.
 */
export const calculateTotalValue = (quantity: number, unitValue: number): number => {
    return quantity * unitValue;
};
