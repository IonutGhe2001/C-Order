import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { KpiCardModern, KpiSkeleton, EmptyState } from '../components/dashboard';
import { Button } from '../components/ui/button';
import { Icon } from '../lib/lucide-icon';
import { getTaskSummary } from '../lib/api';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [range, setRange] = useState<'7d' | '30d' | '90d'>(() => {
    const params = new URLSearchParams(location.search);
    const r = params.get('range');
    return r === '7d' || r === '30d' || r === '90d' ? r : '7d';
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const r = params.get('range');
    if (r === '7d' || r === '30d' || r === '90d') {
      setRange(r as '7d' | '30d' | '90d');
    }
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('range') !== range) {
      params.set('range', range);
      navigate(
        { pathname: location.pathname, search: params.toString() },
        { replace: true }
      );
    }
  }, [range, navigate, location.pathname, location.search]);
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks', 'summary', range],
    queryFn: () => getTaskSummary(range),
    staleTime: 120000,
  });
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { t } = useTranslation();

  const shouldReduceMotion = useReducedMotion();
  const Main = shouldReduceMotion ? 'main' : motion.main;
  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <Main
        id="main-content"
        className="pt-14 md:ml-60 ml-0 p-6"
        {...(shouldReduceMotion
          ? {}
          : {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: 20 },
            })}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">{t('nav.dashboard')}</h1>
            <div className="flex items-center gap-2">
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
              <Button variant="secondary" onClick={() => refetch()} aria-label="Refresh">
                Refresh
              </Button>
            </div>
          </div>
          {isError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md bg-danger p-4 text-brand-fg"
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                      href={
                        kpi.href
                          ? `${kpi.href}${kpi.href.includes('?') ? '&' : '?'}range=${range}`
                          : undefined
                      }
                    />
                  ))}
            </div>
          )}
        </div>
      </Main>
    </>
  );
}