import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const primaryClasses = 'bg-brand text-brand-fg hover:bg-brand/90'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        primary: primaryClasses,
        default: primaryClasses,
        secondary: 'bg-brand-muted text-brand hover:bg-brand hover:text-brand-fg',
        link: 'text-brand underline-offset-4 hover:underline',
        destructive:
          'bg-danger text-brand-fg hover:bg-danger/90',
        ghost: 'bg-transparent text-brand hover:bg-brand-muted',
        outline:
          'border border-brand bg-transparent text-brand hover:bg-brand-muted',
      },
      size: {
        sm: 'h-9 rounded-md px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp: any = asChild ? Slot : motion.button
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...(!asChild
          ? {
              whileHover: { scale: 1.03, transition: { duration: 0.15 } },
              whileTap: { scale: 0.97, transition: { duration: 0.15 } },
            }
          : {})}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }