import React from 'react';

interface Column<T> {
    header: string;
    accessor: (item: T) => React.ReactNode;
    className?: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    emptyMessage?: string;
}

export function Table<T>({ data, columns, keyExtractor, emptyMessage = 'No data available' }: TableProps<T>) {
    if (!data || data.length === 0) {
        return <div className="text-center py-8 text-gray-500">{emptyMessage}</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                scope="col"
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                        <tr key={keyExtractor(item)}>
                            {columns.map((col, index) => (
                                <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {col.accessor(item)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
