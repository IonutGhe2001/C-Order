import { lazy, Suspense, useMemo } from 'react';
import type { SVGProps } from 'react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

export type IconName = keyof typeof dynamicIconImports;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  const Lucide = useMemo(() => lazy(dynamicIconImports[name]), [name]);
  return (
    <Suspense fallback={null}>
      <Lucide {...props} />
    </Suspense>
  );
}