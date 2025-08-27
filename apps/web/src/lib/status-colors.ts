import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';

export type StatusColor = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export const statusColors: Record<string, StatusColor> = {
  OPEN: 'info',
  IN_PROGRESS: 'warning',
  BLOCKED: 'danger',
  DONE: 'success',
  LIVRAT_PARTIAL: 'warning',
  FINALIZAT: 'success',
  CANCELLED: 'info',
};

export function getStatusColor(status: string): StatusColor {
  return statusColors[status] || 'info';
}