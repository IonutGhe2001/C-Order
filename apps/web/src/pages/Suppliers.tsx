import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { listSuppliers } from '../lib/api';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ColumnDef, useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, ColumnFiltersState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

interface Supplier {
  id: string;
  name: string;
  taxId?: string | null;
  email?: string | null;
  phone?: string | null;
}

function Filter({ column }: { column: any }) {
  const { t } = useTranslation();
  const columnFilterValue = column.getFilterValue();
  return (
    <Input
      className="w-full"
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={t('placeholders.filter')}
    />
  );
}

export default function Suppliers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => listSuppliers(''),
  });
  const columns: ColumnDef<Supplier>[] = [
    { accessorKey: 'name', header: t('labels.name'), enableColumnFilter: true },
    { accessorKey: 'taxId', header: t('labels.taxId'), enableColumnFilter: true },
    { accessorKey: 'email', header: t('labels.email'), enableColumnFilter: true },
    { accessorKey: 'phone', header: t('labels.phone'), enableColumnFilter: true },
  ];
  const table = useReactTable({
    data: data?.items || [],
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="p-4 md:ml-60 mt-14">
        <h1 className="text-xl font-semibold mb-4">{t('titles.suppliers')}</h1>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center text-red-600">
            {t('messages.suppliersLoadFailed')}
            <Button variant="outline" className="ml-2" onClick={() => refetch()}>
              {t('buttons.retry')}
            </Button>
          </div>
        ) : (
          <div>
            <div className="overflow-auto">
              <table className="min-w-full border">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="p-2 border-b text-left">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanFilter() && (
                            <div className="mt-1">
                              <Filter column={header.column} />
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/suppliers/${row.original.id}`)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-2">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Prev
              </Button>
              <span className="text-sm">
                {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}