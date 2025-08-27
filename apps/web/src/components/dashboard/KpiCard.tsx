import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Metric, Text, SparkAreaChart } from '@tremor/react';

export interface KpiCardProps {
  title: string;
  value: number;
  trend: number[];
}

export default function KpiCard({ title, value, trend }: KpiCardProps) {
  const data = trend.map((v, i) => ({ index: i, value: v }));
  return (
    <Link to="/reports" className="block">
      <Card className="p-4 transition-shadow duration-200 hover:shadow-md motion-reduce:transition-none">
        <Text>{title}</Text>
        <Metric className="mt-2">{value}</Metric>
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