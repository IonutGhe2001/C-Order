import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { listSuppliers } from '../lib/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTranslation } from 'react-i18next';

export default function SuppliersList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => listSuppliers(''),
  });
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const filtered = data?.items?.filter((s: any) =>
    s.name.toLowerCase().includes(filter.toLowerCase()),
  ) || [];
  const pageSize = 50;
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(filtered.length / pageSize) || 1;
  const pageData = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: pageData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length
    ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
    : 0;

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="p-4 md:ml-60 mt-14">
        <h1 className="text-xl font-semibold mb-4">Suppliers</h1>
        <Input
          placeholder={t('placeholders.search')}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-48 mb-2"
        />
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
        ) : !filtered.length ? (
          <div className="text-center text-gray-500 text-sm">
            {t('messages.noSuppliers')}
            <Button className="ml-2" onClick={() => {}}>{t('buttons.addSupplier')}</Button>
          </div>
        ) : (
          <>
            <div ref={parentRef} className="h-96 overflow-auto border rounded">
              <table className="min-w-full">
                <tbody>
                  {paddingTop > 0 && (
                    <tr>
                      <td style={{ height: paddingTop }} />
                    </tr>
                  )}
                  {virtualItems.map((virtualRow) => {
                    const supplier = pageData[virtualRow.index];
                    return (
                      <tr
                        key={supplier.id}
                        className="border-b" 
                        ref={rowVirtualizer.measureElement}
                        style={{ transform: `translateY(${virtualRow.start}px)` }}
                      >
                        <td className="p-2">{supplier.name}</td>
                      </tr>
                    );
                  })}
                  {paddingBottom > 0 && (
                    <tr>
                      <td style={{ height: paddingBottom }} />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
              >
                Prev
              </Button>
              <span className="text-sm">
                {page + 1} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, pageCount - 1))}
                disabled={page + 1 >= pageCount}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}