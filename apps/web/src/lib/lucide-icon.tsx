import { lazy, Suspense, useMemo } from 'react';
import type { SVGProps } from 'react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

export type IconName = keyof typeof dynamicIconImports;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  const importFn = dynamicIconImports[name]
  const Lucide = useMemo(() => (importFn ? lazy(importFn) : null), [importFn])

  if (!Lucide) return null
  return (
    <Suspense fallback={null}>
      <Lucide {...props} />
    </Suspense>
  )
}