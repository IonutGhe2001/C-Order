import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Metric, Text, SparkAreaChart } from '@tremor/react';
import { formatNumber } from '@/lib/i18n';

export interface KpiCardProps {
  title: string;
  value: number;
  trend: number[];
}

export default function KpiCard({ title, value, trend }: KpiCardProps) {
  const data = trend.map((v, i) => ({ index: i, value: v }));
  return (
    <Link
      to="/reports"
      aria-label={title}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <Card className="p-4 transition-shadow duration-200 hover:shadow-md motion-reduce:transition-none border bg-background">
        <Text>{title}</Text>
        <Metric className="mt-2">{formatNumber(value)}</Metric>
        <SparkAreaChart
          data={data}
          index="index"
          categories={["value"]}
          colors={["indigo"]}
          className="h-12 mt-4"
        />
      </Card>
    </Link>
  );
}