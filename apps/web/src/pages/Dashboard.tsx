import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import KpiCard from '../components/dashboard/KpiCard';
import { getTaskSummary } from '../lib/api';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', 'summary'],
    queryFn: getTaskSummary,
  });
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="pt-14 md:ml-60 ml-0 p-6"
      >
        <h1 className="text-xl font-bold mb-4">Dashboard</h1>
        {isLoading && <div>Loading...</div>}
        {isError && <div>{t('messages.loadError')}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.isArray(data) &&
            data.map((kpi) => (
              <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} trend={kpi.trend} />
            ))}
        </div>
      </motion.main>
    </>
  );
}