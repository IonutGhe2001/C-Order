import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/lib/status-colors';
import { formatDate } from '@/lib/i18n';

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignees?: { id: string; name: string }[];
  dueDate?: string | null;
}

export const statusOptions = [
  { value: 'OPEN', label: 'statuses.OPEN' },
  { value: 'IN_PROGRESS', label: 'statuses.IN_PROGRESS' },
  { value: 'BLOCKED', label: 'statuses.BLOCKED' },
  { value: 'DONE', label: 'statuses.DONE' },
  { value: 'LIVRAT_PARTIAL', label: 'statuses.LIVRAT_PARTIAL' },
  { value: 'FINALIZAT', label: 'statuses.FINALIZAT' },
  { value: 'CANCELLED', label: 'statuses.CANCELLED' },
];

export const statusLabels: Record<string, string> = Object.fromEntries(
  statusOptions.map((s) => [s.value, s.label]),
);

export const createTaskColumns = (t: (key: string) => string): ColumnDef<Task>[] => [
  {
    accessorKey: 'title',
    header: t('labels.title'),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'status',
    header: t('labels.status'),
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ getValue }) => {
      const val = getValue() as string;
      return (
        <Badge variant={getStatusColor(val)}>{t(statusLabels[val] || `statuses.${val}`)}</Badge>
      );
    },
    filterFn: 'equals',
  },
  {
    accessorKey: 'priority',
    header: t('labels.priority'),
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ getValue }) => t(`priority.${getValue()}`),
  },
  {
    accessorKey: 'dueDate',
    header: t('labels.dueDate'),
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ getValue }) => {
      const v = getValue() as string | undefined;
      return v ? formatDate(new Date(v)) : '-';
    },
  },
  {
    accessorKey: 'assignees',
    header: t('labels.assignees'),
    enableSorting: false,
    enableColumnFilter: true,
    cell: ({ getValue }) => {
      const list = getValue() as { name: string }[] | undefined;
      return list?.map((a) => a.name).join(', ') || '-';
    },
  },
];