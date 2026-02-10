/**
 * Format a number as Brazilian currency (BRL).
 * @param value The number to format.
 * @returns A string representing the currency, e.g., "R$ 1.234,56".
 */
export const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

/**
 * Format a number as Brazilian currency without the symbol (e.g., "1.234,56").
 * Useful when the symbol is displayed separately.
 * @param value The number to format.
 * @returns A string representing the formatted number.
 */
export const formatCurrencyValue = (value: number): string => {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

/**
 * Format a date object to a standard Brazilian date string (DD/MM/YYYY).
 * @param date The Date object to format. -
 * @returns A string representing the date.
 */
export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR');
};

/**
 * Format a date object to a YYYY-MM-DD string in local time.
 * Useful for <input type="date">.
 */
export const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Parse a YYYY-MM-DD string into a local Date object.
 */
export const parseLocalDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
};
