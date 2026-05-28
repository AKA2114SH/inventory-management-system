import React from 'react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

export function Table<T extends { id: number }>({ columns, data, onRowClick }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neon-cyan/30">
            {columns.map((col) => (
              <th key={String(col.key)} className="text-left py-3 px-4 text-neon-cyan font-mono">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className="border-b border-dark-100 hover:bg-dark-100/50 transition-colors cursor-pointer"
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="py-3 px-4">
                  {col.render ? col.render(item[col.key as keyof T], item) : String(item[col.key as keyof T])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
