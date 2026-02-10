import React from 'react';

export interface Column<T> {
    header: string;
    accessor?: keyof T;
    render?: (item: T) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    rowClassName?: (item: T) => string;
}

export const DataTable = <T,>({ data, columns, keyExtractor, rowClassName }: DataTableProps<T>) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                scope="col"
                                className={`px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-${col.align || 'left'} ${col.className || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                    {data.map((item) => (
                        <tr key={keyExtractor(item)} className={rowClassName ? rowClassName(item) : ''}>
                            {columns.map((col, index) => (
                                <td
                                    key={index}
                                    className={`px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-${col.align || 'left'}`}
                                >
                                    {col.render ? col.render(item) : (col.accessor ? String(item[col.accessor]) : null)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
