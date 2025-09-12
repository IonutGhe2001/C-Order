import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
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
  Table,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listTasks, getTask, TaskFilters, updateTask } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import TaskCard from './TaskCard';
import TaskCardSkeleton from './TaskCardSkeleton';
import { Task, createTaskColumns } from './columns';
import { Icon } from '@/lib/lucide-icon';
import { useTranslation } from 'react-i18next';
import CreateTaskSheet from './CreateTaskSheet';
import { useTimeToAction } from '@/lib/use-tta';
import BottomActionBar from '../ui/bottom-action-bar';

export function TasksDataTableSkeleton({ isMobile = false }: { isMobile?: boolean }) {
  if (isMobile) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <table className="w-full rounded-md shadow-sm divide-y">
      <thead className="bg-brand-muted">
        <tr className="divide-x">
          <th className="p-4 w-8">
            <Skeleton className="h-4 w-4" />
          </th>
          <th className="p-4">
            <Skeleton className="h-4 w-40" />
          </th>
          <th className="p-4">
            <Skeleton className="h-4 w-24" />
          </th>
          <th className="p-4">
            <Skeleton className="h-4 w-20" />
          </th>
          <th className="p-4">
            <Skeleton className="h-4 w-24" />
          </th>
          <th className="p-4">
            <Skeleton className="h-4 w-24" />
          </th>
          <th className="p-4">
            <Skeleton className="h-4 w-32" />
          </th>
          <th className="p-4 w-8" />
        </tr>
      </thead>
      <tbody className="divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="divide-x even:bg-brand-muted/50">
            <td className="p-4">
              <Skeleton className="h-4 w-4" />
            </td>
            <td className="p-4">
              <Skeleton className="h-4 w-40" />
            </td>
            <td className="p-4">
              <Skeleton className="h-4 w-24" />
            </td>
            <td className="p-4">
              <Skeleton className="h-4 w-20" />
            </td>
            <td className="p-4">
              <Skeleton className="h-4 w-24" />
            </td>
            <td className="p-4">
              <Skeleton className="h-4 w-24" />
            </td>
            <td className="p-4">
              <Skeleton className="h-4 w-32" />
            </td>
            <td className="p-4" />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function TasksDataTable({
  quickFilter = '',
  filters = {},
  search = '',
  onSelectionChange,
  onTableChange,
  onColumnVisibilityChange,
  onArchive,
  onDelete,
  view = 'table',
  columnNames = {},
  customColumns = [],
}: {
  quickFilter?: '' | 'overdue' | 'today' | 'noAssignee';
  filters?: TaskFilters;
  search?: string;
  onSelectionChange?: (ids: string[]) => void;
  onTableChange?: (table: Table<Task>) => void;
  onColumnVisibilityChange?: (state: VisibilityState) => void;
  onArchive?: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
  view?: 'table' | 'card';
  columnNames?: Record<string, string>;
  customColumns?: { id: string; header: string }[];
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => listTasks(filters),
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [customData, setCustomData] = useState<Record<string, Record<string, string>>>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<'left' | 'right' | null>(null);
  const isCardView = view === 'card';

  useEffect(() => {
    const savedVisibility = localStorage.getItem('tasksTableColumnVisibility');
    const savedOrder = localStorage.getItem('tasksTableColumnOrder');
    if (savedVisibility) {
      try {
        setColumnVisibility(JSON.parse(savedVisibility));
      } catch {
        /* ignore */
      }
    }
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder).filter((id: string) => id !== 'menu');
        setColumnOrder(parsed);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('tasksCustomData');
    if (saved) {
      try {
        setCustomData(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (data?.items) {
      setCustomData((prev) => {
        const next = { ...prev };
        (data.items as any[]).forEach((task: any) => {
          if (task.custom) {
            next[task.id] = { ...(next[task.id] || {}), ...(task.custom as Record<string, string>) };
          }
        });
        return next;
      });
    }
  }, [data]);

  useEffect(() => {
    localStorage.setItem('tasksTableColumnVisibility', JSON.stringify(columnVisibility));
  onColumnVisibilityChange?.(columnVisibility);
  }, [columnVisibility, onColumnVisibilityChange]);

  useEffect(() => {
    localStorage.setItem('tasksTableColumnOrder', JSON.stringify(columnOrder));
  }, [columnOrder]);

   const updateCustomData = useCallback(
    (taskId: string, columnId: string, value: string) => {
      setCustomData((prev) => {
        const row = { ...(prev[taskId] || {}), [columnId]: value };
        const next = { ...prev, [taskId]: row };
        localStorage.setItem('tasksCustomData', JSON.stringify(next));
        return next;
      });
      if (!columnId.startsWith('custom_')) {
        updateTask(taskId, { custom: { [columnId]: value } }).catch(() => undefined);
      }
    },
    []
  );

  const columns = useMemo<ColumnDef<Task>[]>(() => {
    const selectColumn: ColumnDef<Task> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onCheckedChange={(value: boolean) =>
            table.toggleAllRowsSelected(Boolean(value))
          }
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(Boolean(value))}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
      size: 30,
    };
    const baseCols = createTaskColumns(t).map((col) => {
      const key = String((col as any).accessorKey || col.id);
      return {
        ...col,
        id: key,
        accessorKey: (col as any).accessorKey || key,
        header: columnNames[key] || col.header,
      } as ColumnDef<Task>;
    });
    const extraCols = customColumns.map((col) => ({
      id: col.id,
      accessorKey: col.id,
      header: columnNames[col.id] || col.header,
      cell: ({ row }: { row: any }) => {
        const taskId = row.original.id;
        const value = customData[taskId]?.[col.id] || '';
        return (
          <Input
            value={value}
            onChange={(e) => updateCustomData(taskId, col.id, e.target.value)}
          />
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
      }));
    return [selectColumn, ...baseCols, ...extraCols];
  }, [t, columnNames, customColumns, customData, updateCustomData]);

  const filteredData = useMemo(() => {
    const items: Task[] = (data?.items as Task[]) || [];
    if (!quickFilter) return items;
    const today = new Date();
    return items.filter((t) => {
      const due = t.dueDate ? new Date(t.dueDate) : undefined;
      if (quickFilter === 'overdue') {
        return !!due && due < today && t.status !== 'FINALIZAT';
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
      globalFilter: search,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: setRowSelection,
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
    onTableChange?.(table);
  }, [table, onTableChange]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Object.keys(rowSelection).filter((id) => rowSelection[id]));
    }
  }, [rowSelection, onSelectionChange]);

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const useVirtual = !isCardView && filteredData.length > 200;
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
    <td className="p-4">
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

  const handleDragStart = (e: React.DragEvent<HTMLElement>, column: any) => {
    e.dataTransfer.setData('text/plain', column.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>, target: any) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setDragOverId(target.id);
    setDragPosition(x > rect.width / 2 ? 'right' : 'left');
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>, target: any) => {
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;
    const currentOrder = table.getState().columnOrder;
    const newOrder =
      currentOrder.length > 0
        ? [...currentOrder]
        : table
            .getAllLeafColumns()
            .map((c) => c.id)
            .filter((id) => id !== 'menu');
    const from = newOrder.indexOf(draggedId);
    let to = newOrder.indexOf(target.id);
    newOrder.splice(from, 1);
    if (from < to) to--;
    if (dragPosition === 'right') to++;
    newOrder.splice(to, 0, draggedId);
    setColumnOrder(newOrder);
    setDragOverId(null);
    setDragPosition(null);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
    setDragPosition(null);
  };

  const virtualRows = useVirtual ? rowVirtualizer!.getVirtualItems() : [];
  const paddingTop = useVirtual && virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    useVirtual && virtualRows.length > 0
      ? rowVirtualizer!.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;

  if (isLoading) {
    if (isCardView) {
      return <TasksDataTableSkeleton isMobile />;
    }
    return (
      <>
        <div className="hidden md:block">
          <TasksDataTableSkeleton />
        </div>
        <div className="md:hidden">
          <TasksDataTableSkeleton isMobile />
        </div>
      </>
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 p-4 text-center text-sm text-foreground">
        <Icon name="inbox" className="h-12 w-12 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-base font-medium">{t('messages.noTasks')}</p>
          <p className="text-muted-foreground">{t('messages.noTasksGuidance')}</p>
        </div>
        <CreateTaskSheet triggerText={t('buttons.addTask')} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={`grid ${isCardView ? '' : 'md:hidden'} grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}
      >
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
      <div
        ref={tableContainerRef}
        className={`${isCardView ? 'hidden' : 'hidden md:block'} overflow-auto w-full`}
      >
        <table className="w-full rounded-md shadow-sm divide-y">
          <thead className="sticky top-0 bg-brand-muted text-gray-800 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="divide-x">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={`p-4 text-left text-gray-800 bg-brand-muted cursor-move ${
                      dragOverId === header.column.id
                        ? dragPosition === 'right'
                          ? 'border-r-2 border-brand'
                          : 'border-l-2 border-brand'
                        : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, header.column)}
                    onDragOver={(e) => handleDragOver(e, header.column)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, header.column)}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className="flex items-center gap-2 cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && (
                          <Icon name="arrow-up" className="ml-1 inline h-3 w-3" />
                        )}
                        {header.column.getIsSorted() === 'desc' && (
                          <Icon
                            name="arrow-down"
                            className="ml-1 inline h-3 w-3"
                          />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {columnFilters.length > 0 && (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length} className="p-4">
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
                      className={`divide-x even:bg-brand-muted/50 hover:bg-brand-muted cursor-pointer text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${row.getIsSelected() ? 'bg-brand-muted ring-2 ring-brand' : ''}`}
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
                  className={`divide-x even:bg-brand-muted/50 hover:bg-brand-muted cursor-pointer text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${row.getIsSelected() ? 'bg-brand-muted ring-2 ring-brand' : ''}`}
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
    {selectedRows.length > 0 && (
          <BottomActionBar>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {t('messages.selectedCount', { count: selectedRows.length })}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => onDelete?.(selectedRows.map((r) => r.id))}
                >
                  <Icon name="trash" className="h-4 w-4" />
                  <span>{t('buttons.delete')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => onArchive?.(selectedRows.map((r) => r.id))}
                >
                  <Icon name="archive" className="h-4 w-4" />
                  <span>{t('buttons.archive')}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={exportCsv}
                >
                  <Icon name="download" className="h-4 w-4" />
                  <span>CSV</span>
                </Button>
              </div>
            </div>
          </BottomActionBar>
        )}
      </div>
    );
}