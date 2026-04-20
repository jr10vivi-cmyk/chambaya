import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
};

type EmptyState = {
  icon?: ReactNode;
  title?: string;
  subtitle?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T, index: number) => string | number;
  loading?: boolean;
  empty?: EmptyState;
  rowClassName?: (row: T) => string;
  scrollX?: boolean;
};

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  loading,
  empty,
  rowClassName,
  scrollX = false,
}: DataTableProps<T>) {
  let inner: ReactNode;

  if (loading) {
    inner = (
      <div className="flex justify-center items-center h-40">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  } else if (data.length === 0) {
    inner = (
      <div className="text-center py-14 text-gray-400">
        {empty?.icon}
        {empty?.title && <p className="font-medium mt-3">{empty.title}</p>}
        {empty?.subtitle && <p className="text-sm">{empty.subtitle}</p>}
        {!empty?.title && !empty?.subtitle && (
          <p className="text-sm">Sin registros</p>
        )}
      </div>
    );
  } else {
    const table = (
      <table className="w-full">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ${c.headerClassName ?? ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, i) => (
            <tr
              key={getRowKey(row, i)}
              className={`hover:bg-gray-50 transition ${rowClassName?.(row) ?? ""}`}
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-5 py-4 ${c.className ?? ""}`}>
                  {c.cell(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
    inner = scrollX ? <div className="overflow-x-auto">{table}</div> : table;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100">{inner}</div>
  );
}
