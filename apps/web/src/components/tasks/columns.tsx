import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/lib/status-colors';

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignees?: { id: string; name: string }[];
  dueDate?: string | null;
}

export const statusOptions = [
  { value: 'OPEN', label: 'Deschis' },
  { value: 'IN_PROGRESS', label: 'În progres' },
  { value: 'BLOCKED', label: 'Blocat' },
  { value: 'DONE', label: 'Finalizat' },
  { value: 'LIVRAT_PARTIAL', label: 'Livrat parțial' },
  { value: 'FINALIZAT', label: 'Finalizat' },
  { value: 'CANCELLED', label: 'Anulat' },
];

export const statusLabels: Record<string, string> = Object.fromEntries(
  statusOptions.map((s) => [s.value, s.label]),
);

export const taskColumns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: 'Titlu',
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ getValue }) => {
      const val = getValue() as string;
      return (
        <Badge variant={getStatusColor(val)}>{statusLabels[val] || val}</Badge>
      );
    },
    filterFn: 'equals',
  },
  {
    accessorKey: 'priority',
    header: 'Prioritate',
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'dueDate',
    header: 'Data limită',
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ getValue }) => {
      const v = getValue() as string | undefined;
      return v ? new Date(v).toLocaleDateString() : '-';
    },
  },
  {
    accessorKey: 'assignees',
    header: 'Responsabili',
    enableSorting: false,
    enableColumnFilter: true,
    cell: ({ getValue }) => {
      const list = getValue() as { name: string }[] | undefined;
      return list?.map((a) => a.name).join(', ') || '-';
    },
  },
];