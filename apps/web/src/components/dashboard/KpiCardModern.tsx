import React from 'react';
import { Link } from 'react-router-dom';
import { SparkAreaChart } from '@tremor/react';
import { Icon, IconName } from '@/lib/lucide-icon';
import { formatNumber } from '@/lib/i18n';

export interface KpiCardModernProps {
  title: string;
  value: number;
  trend: number[];
  delta?: number;
  icon?: string;
  href?: string;
}

export default function KpiCardModern({
  title,
  value,
  trend,
  delta,
  icon,
  href,
}: KpiCardModernProps) {
  const data = trend.map((v, i) => ({ index: i, value: v }));
  const card = (
    <div
      className="rounded-2xl border p-4 hover:shadow-md focus-visible:ring-2 outline-none"
      role={href ? 'button' : undefined}
      tabIndex={href ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            {title}
          </span>
          <span className="text-2xl font-semibold">{formatNumber(value)}</span>
          {delta != null && (
            <span className="text-xs text-muted-foreground">
              {delta > 0 ? '+' : ''}
              {formatNumber(delta)}
            </span>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border">
            <Icon name={icon as IconName} className="h-5 w-5" />
          </div>
        )}
      </div>
      <SparkAreaChart
        data={data}
        index="index"
        categories={['value']}
        colors={['indigo']}
        curveType="monotone"
        className="h-12 mt-4"
      />
    </div>
  );

  return href ? (
    <Link to={href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}