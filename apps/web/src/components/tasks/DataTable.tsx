import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  ColumnOrderState,
  ColumnPinningState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listTasks, listUsers, updateTask, TaskPayload, getTask, deleteTask } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toaster';
import { Badge } from '@/components/ui/badge';
import TaskCard from './TaskCard';
import { Task, createTaskColumns, statusOptions } from './columns';
import { Icon } from '@/lib/lucide-icon';
import { useTranslation } from 'react-i18next';
import CreateTaskSheet from './CreateTaskSheet';
import { useTimeToAction } from '@/lib/use-tta';

function Filter({ column }: { column: any }) {
  const columnFilterValue = column.getFilterValue();
  const { t } = useTranslation();
  if (column.id === 'status') {
    return (
      <select
        className="border rounded p-1 w-full"
        value={(columnFilterValue ?? '') as string}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      >
        <option value="">{t('labels.all')}</option>
        {statusOptions.map((s) => (
          <option key={s.value} value={s.value}>
            {t(s.label)}
          </option>
        ))}
      </select>
    );
  }
  return (
    <Input
      className="w-full"
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={t('placeholders.filter')}
    />
  );
}

export default function TasksDataTable({
  quickFilter = '',
  onSelectionChange,
}: {
  quickFilter?: '' | 'overdue' | 'today' | 'noAssignee';
  onSelectionChange?: (ids: string[]) => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => listTasks(),
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    right: ['menu'],
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [showColumns, setShowColumns] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [density, setDensity] = useState<'default' | 'compact'>(() =>
    document.body.dataset.density === 'compact' ? 'compact' : 'default',
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handle = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile(e.matches);
    handle(mq);
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, []);

  useEffect(() => {
    const close = () => setOpenMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const toggleDensity = () => {
    const next = density === 'compact' ? 'default' : 'compact';
    setDensity(next);
    if (next === 'compact') {
      document.body.dataset.density = 'compact';
    } else {
      delete document.body.dataset.density;
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    onError: () => toast({ title: t('messages.updateFailed'), variant: 'error' }),
  });

  const columns = useMemo<ColumnDef<Task>[]>(() => {
    const selectColumn: ColumnDef<Task> = {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
      size: 30,
    };
    const actionColumn: ColumnDef<Task> = {
      id: 'menu',
      header: () => '...',
      cell: ({ row }) => (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            variant="ghost"
            className="text-brand hover:text-brand-fg"
            onClick={() =>
              setOpenMenu(openMenu === row.original.id ? null : row.original.id)
            }
            aria-label="More options"
          >
            <Icon name="more-horizontal" className="h-4 w-4" />
          </Button>
          {openMenu === row.original.id && (
            <div
              className="absolute right-0 mt-1 bg-white border rounded shadow flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  navigate(`/tasks/${row.original.id}`);
                  setOpenMenu(null);
                }}
                aria-label="View task"
              >
                <Icon name="eye" className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  deleteMutation.mutate(row.original.id);
                  setOpenMenu(null);
                }}
                aria-label="Delete task"
              >
                <Icon name="trash" className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      size: 40,
    };
    return [selectColumn, ...createTaskColumns(t), actionColumn];
  }, [navigate, t, openMenu, deleteMutation]);

  const filteredData = useMemo(() => {
    const items: Task[] = (data?.items as Task[]) || [];
    if (!quickFilter) return items;
    const today = new Date();
    return items.filter((t) => {
      const due = t.dueDate ? new Date(t.dueDate) : undefined;
      if (quickFilter === 'overdue') {
        return !!due && due < today && t.status !== 'DONE';
      }
      if (quickFilter === 'today') {
        return (
          !!due &&
          due.getFullYear() === today.getFullYear() &&
          due.getMonth() === today.getMonth() &&
          due.getDate() === today.getDate()
        );
      }
      if (quickFilter === 'noAssignee') {
        return !t.assignees || t.assignees.length === 0;
      }
      return true;
    });
  }, [data, quickFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
      columnPinning,
      rowSelection,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    enableMultiSort: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    debugTable: false,
  });

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Object.keys(rowSelection).filter((id) => rowSelection[id]));
    }
  }, [rowSelection, onSelectionChange]);

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
    enabled: table.getSelectedRowModel().rows.length > 0,
  });

  const mutation = useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: Partial<TaskPayload> }) => {
      await Promise.all(ids.map((id) => updateTask(id, data)));
    },
    onMutate: async ({ ids, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<any>(['tasks']);
      const userMap: Record<string, string> = Object.fromEntries(
        usersQuery.data?.items?.map((u: any) => [u.id, u.name]) || [],
      );
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.map((t: any) => {
            if (!ids.includes(t.id)) return t;
            return {
              ...t,
              ...(data.status ? { status: data.status } : {}),
              ...(data.assignees
                ? {
                    assignees: data.assignees.map((id: string) => ({
                      id,
                      name: userMap[id] || id,
                    })),
                  }
                : {}),
              ...(data.dueDate ? { dueDate: data.dueDate } : {}),
            };
          }),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['tasks'], ctx.previous);
      }
      toast({ title: t('messages.updateFailed'), variant: 'error' });
    },
    onSuccess: () => toast({ title: t('messages.updateSuccess'), variant: 'success' }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setRowSelection({});
    },
  });

  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkAssignees, setBulkAssignees] = useState<string[]>([]);
  const [bulkDueDate, setBulkDueDate] = useState('');

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const useVirtual = filteredData.length > 200;
  const rowVirtualizer = useVirtual
    ? useVirtualizer({
        count: table.getRowModel().rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 48,
        overscan: 5,
      })
    : null;
    const logRowClick = useTimeToAction('open_task_detail');
  const MemoCell = React.memo(({ cell }: { cell: any }) => (
    <td
      className={`p-2 ${cell.column.id === 'menu' ? 'sticky right-0 bg-white' : ''}`}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  ));
  const handleRowKeyDown = (
    e: React.KeyboardEvent<HTMLTableRowElement>,
    index: number,
    id: string
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      logRowClick();
      navigate(`/tasks/${id}`);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (useVirtual) {
        rowVirtualizer?.scrollToIndex(index + 1);
      } else {
        rowRefs.current[index + 1]?.scrollIntoView({ block: 'nearest' });
      }
      rowRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (useVirtual) {
        rowVirtualizer?.scrollToIndex(index - 1);
      } else {
        rowRefs.current[index - 1]?.scrollIntoView({ block: 'nearest' });
      }
      rowRefs.current[index - 1]?.focus();
    }
  };

  const handleBulkApply = () => {
    const payload: Partial<TaskPayload> = {};
    if (bulkStatus) payload.status = bulkStatus;
    if (bulkAssignees.length) payload.assignees = bulkAssignees;
    if (bulkDueDate) payload.dueDate = new Date(bulkDueDate).toISOString();
    if (Object.keys(payload).length) {
      mutation.mutate({ ids: selectedRows.map((r) => r.id), data: payload });
    }
  };

  const exportCsv = () => {
    const headers = table
      .getAllLeafColumns()
      .filter((c) => c.id !== 'select' && c.getIsVisible())
      .map((c) => c.id);
    const csvRows = [headers.join(',')];
    selectedRows.forEach((row) => {
      const vals = headers.map((h) => {
        const v: any = (row as any)[h];
        if (Array.isArray(v)) return '"' + v.map((i: any) => i.name || i).join(';') + '"';
        return '"' + (v ?? '') + '"';
      });
      csvRows.push(vals.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableCellElement>, column: any) => {
    e.dataTransfer.setData('text/plain', column.id);
  };

  const handleDrop = (e: React.DragEvent<HTMLTableCellElement>, target: any) => {
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;
    const newOrder = [...table.getState().columnOrder];
    const from = newOrder.indexOf(draggedId);
    const to = newOrder.indexOf(target.id);
    newOrder.splice(from, 1);
    newOrder.splice(to, 0, draggedId);
    setColumnOrder(newOrder);
  };

  const virtualRows = useVirtual ? rowVirtualizer!.getVirtualItems() : [];
  const paddingTop = useVirtual && virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    useVirtual && virtualRows.length > 0
      ? rowVirtualizer!.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;

  if (isLoading) {
    return (
      <table className="min-w-full border">
        <tbody>
          {Array.from({ length: 3 }).map((_, i) => (
            <tr key={i} className="border-t">
              <td className="p-2"><Skeleton className="h-4 w-40" /></td>
              <td className="p-2"><Skeleton className="h-4 w-32" /></td>
              <td className="p-2"><Skeleton className="h-4 w-20" /></td>
              <td className="p-2" />
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-600">
        {t('messages.tasksLoadFailed')}
        <Button variant="outline" className="ml-2" onClick={() => refetch()}>{t('buttons.retry')}</Button>
      </div>
    );
  }

  if (!data?.items?.length) {
    return (
      <div className="text-center p-4 text-sm text-brand-fg space-y-2">
        <p>{t('messages.noTasks')}</p>
        <CreateTaskSheet triggerText="Creează" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="sticky top-0 z-20 bg-white">
        {selectedRows.length > 0 ? (
          <div className="flex flex-wrap items-end gap-2 p-2 border-b">
            <span className="text-sm">
              {t('messages.selectedCount', { count: selectedRows.length })}
            </span>
            <select
              className="border p-1 rounded"
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
            >
              <option value="">{t('labels.status')}</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {t(s.label)}
                </option>
              ))}
            </select>
          {usersQuery.isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : usersQuery.isError ? null : (
              <select
                multiple
                className="border p-1 rounded h-20"
                value={bulkAssignees}
                onChange={(e) =>
                  setBulkAssignees(Array.from(e.target.selectedOptions, (o) => o.value))
                }
              >
                {usersQuery.data?.items?.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}
            <Input
              type="date"
              className="w-40"
              value={bulkDueDate}
              onChange={(e) => setBulkDueDate(e.target.value)}
            />
            <Button size="sm" onClick={handleBulkApply} disabled={mutation.isPending}>
              {t('buttons.apply')}
            </Button>
            <Button size="sm" variant="outline" onClick={exportCsv}>
              Export CSV
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 border-b">
            <Input
              placeholder={t('placeholders.search')}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-48"
            />
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowColumns((s) => !s)}>
                {t('labels.columns')}
              </Button>
              {showColumns && (
                <div className="absolute z-10 bg-white border rounded shadow p-2 mt-1">
                  {table.getAllLeafColumns().map((column) => (
                    <div key={column.id} className="flex items-center justify-between py-1">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={column.getIsVisible()}
                          onChange={column.getToggleVisibilityHandler()}
                        />
                        {column.id}
                      </label>
                      {column.getCanPin() && (
                        <div className="space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => column.pin('left')}>L</Button>
                          <Button size="sm" variant="ghost" onClick={() => column.pin('right')}>R</Button>
                          <Button size="sm" variant="ghost" onClick={() => column.pin(false)}>U</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={toggleDensity}
              aria-label="Toggle density"
            >
              <Icon name="list" className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {isMobile ? (
        <div className="grid gap-2">
          {table.getRowModel().rows.map((row) => (
            <TaskCard
              key={row.id}
              task={row.original}
              selected={row.getIsSelected()}
              onSelectChange={row.getToggleSelectedHandler()}
              onClick={() => navigate(`/tasks/${row.original.id}`)}
            />
          ))}
        </div>
      ) : (
        <div ref={tableContainerRef} className="overflow-auto">
          <table className="min-w-full border">
            <thead className="sticky top-0 bg-brand-muted z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={`p-2 border-b text-left ${
                        header.column.id === 'menu' ? 'sticky right-0 bg-brand-muted' : 'bg-brand-muted'
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, header.column)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, header.column)}
                    >
                      <div className="flex flex-col gap-1">
                        {header.isPlaceholder ? null : (
                          <div
                            className="flex items-center gap-2 cursor-pointer select-none"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === 'asc' && '▲'}
                            {header.column.getIsSorted() === 'desc' && '▼'}
                          </div>
                        )}
                        {header.column.getCanFilter() && <Filter column={header.column} />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {columnFilters.length > 0 && (
                <tr>
                  <td
                    colSpan={table.getVisibleLeafColumns().length}
                    className="p-2 border-b"
                  >
                    <div className="flex flex-wrap gap-2">
                      {columnFilters.map((cf) => {
                        const column = table.getColumn(cf.id);
                        if (!column) return null;
                        return (
                          <Badge key={cf.id} className="flex items-center gap-1">
                            <span>
                              {cf.id}: {String(cf.value)}
                            </span>
                            <button
                              onClick={() => column.setFilterValue(undefined)}
                              aria-label="Remove filter"
                            >
                              <Icon name="x" className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              )}
              {useVirtual ? (
                <>
                  {paddingTop > 0 && (
                    <tr>
                      <td style={{ height: paddingTop }} />
                    </tr>
                  )}
                  {virtualRows.map((virtualRow) => {
                    const row = table.getRowModel().rows[virtualRow.index];
                    return (
                      <tr
                        key={row.id}
                        ref={(el) => {
                          rowRefs.current[virtualRow.index] = el;
                          if (el) rowVirtualizer!.measureElement(el);
                        }}
                        data-index={virtualRow.index}
                        tabIndex={0}
                        className={`border-t hover:bg-brand-muted cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${row.getIsSelected() ? 'bg-brand-muted ring-2 ring-brand' : ''}`}
                        onClick={() => {
                          logRowClick();
                          navigate(`/tasks/${row.original.id}`);
                        }}
                        onMouseEnter={() =>
                          queryClient.prefetchQuery({
                            queryKey: ['task', row.original.id],
                            queryFn: () => getTask(row.original.id),
                          })
                        }
                        onKeyDown={(e) => handleRowKeyDown(e, virtualRow.index, row.original.id)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <MemoCell key={cell.id} cell={cell} />
                        ))}
                      </tr>
                    );
                  })}
                  {paddingBottom > 0 && (
                    <tr>
                      <td style={{ height: paddingBottom }} />
                    </tr>
                  )}
                </>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    ref={(el) => {
                      rowRefs.current[index] = el;
                    }}
                    data-index={index}
                    tabIndex={0}
                    className={`border-t hover:bg-brand-muted cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${row.getIsSelected() ? 'bg-brand-muted ring-2 ring-brand' : ''}`}
                    onClick={() => {
                      logRowClick();
                      navigate(`/tasks/${row.original.id}`);
                    }}
                    onMouseEnter={() =>
                      queryClient.prefetchQuery({
                        queryKey: ['task', row.original.id],
                        queryFn: () => getTask(row.original.id),
                      })
                    }
                    onKeyDown={(e) => handleRowKeyDown(e, index, row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <MemoCell key={cell.id} cell={cell} />
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-end gap-2">
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
        <select
          className="border rounded p-1 text-sm"
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          {[25, 50, 100].map((s) => (
            <option key={s} value={s}>
              {s} / pag
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}