import React from 'react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './sheet';
import { SidePanel } from './side-panel';
import { useMediaQuery } from '@/lib/use-media-query';

interface ResponsivePanelProps {
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ResponsivePanel({
  trigger,
  title,
  children,
  className,
}: ResponsivePanelProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <div className={className}><SidePanel>{children}</SidePanel></div>;
  }

  return (
    <div className={className}>
      <Sheet>
        {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
        <SheetContent>
          {title && (
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
          )}
          {children}
        </SheetContent>
      </Sheet>
    </div>
  );
}