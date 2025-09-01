import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { KpiCardModern, KpiSkeleton, EmptyState } from '../components/dashboard';
import { Button } from '../components/ui/button';
import { Icon } from '../lib/lucide-icon';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import { getTaskSummary } from '../lib/api';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks', 'summary', range],
    queryFn: () => getTaskSummary(range),
    staleTime: 120000,
  });
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { t } = useTranslation();

  const shouldReduceMotion = useReducedMotion();
  const content = (
    <>
      <div className="flex items-center gap-2 mb-4">
        <select
          aria-label="Date range"
          value={range}
          onChange={(e) => setRange(e.target.value as '7d' | '30d' | '90d')}
          className="border bg-background rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        <Button
          variant="secondary"
          onClick={() => refetch()}
          aria-label="Refresh"
        >
          Refresh
        </Button>
      </div>
      {isError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-md bg-danger p-4 text-brand-fg"
        >
          <Icon name="alert-triangle" className="h-4 w-4" />
          <span className="flex-1">{t('messages.loadError')}</span>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}
      {data.length === 0 && !isLoading && !isError ? (
          <EmptyState
            title="No data available"
            description="Try adjusting your filters"
            onReset={() => {
              setRange('7d');
              refetch();
            }}
          />
        ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
            : data.map((kpi) => (
                <KpiCardModern
                  key={kpi.title}
                  title={kpi.title}
                  value={kpi.value}
                  trend={kpi.trend}
                  delta={kpi.delta}
                  icon={kpi.icon}
                  href={kpi.href}
                />
              ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
        <div className="md:col-span-2">
          <RecentActivity />
        </div>
        <div className="md:col-span-1">
          <QuickActions />
        </div>
      </div>
    </>
  );
  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      {shouldReduceMotion ? (
        <main id="main-content" className="pt-14 md:ml-60 ml-0 p-6">
          <h1 className="text-xl font-bold mb-4">{t('nav.dashboard')}</h1>
          {content}
        </main>
      ) : (
        <motion.main
          id="main-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="pt-14 md:ml-60 ml-0 p-6"
        >
          <h1 className="text-xl font-bold mb-4">{t('nav.dashboard')}</h1>
          {content}
        </motion.main>
      )}
    </>
  );
}