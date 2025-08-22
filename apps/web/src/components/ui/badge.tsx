import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        open: 'bg-status-open/10 text-status-open border-status-open',
        'in-progress': 'bg-status-in-progress/10 text-status-in-progress border-status-in-progress',
        blocked: 'bg-status-blocked/10 text-status-blocked border-status-blocked',
        done: 'bg-status-done/10 text-status-done border-status-done',
        cancelled: 'bg-status-cancelled/10 text-status-cancelled border-status-cancelled',
        default: 'bg-blue-600 text-white border-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }