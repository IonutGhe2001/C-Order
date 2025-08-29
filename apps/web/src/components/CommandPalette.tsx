import React from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { listTasks, listUsers, listSuppliers, getTask } from '@/lib/api';
import { useTranslation } from 'react-i18next';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { t } = useTranslation();

  const tasksQuery = useQuery({
    queryKey: ['cp-tasks'],
    queryFn: () => listTasks(),
    enabled: open,
  });

  const usersQuery = useQuery({
    queryKey: ['cp-users'],
    queryFn: () => listUsers(),
    enabled: open,
  });

  const suppliersQuery = useQuery({
    queryKey: ['cp-suppliers'],
    queryFn: () => listSuppliers(''),
    enabled: open,
  });

  const viewsQuery = useQuery({
    queryKey: ['cp-views', t],
    queryFn: async () => [
      { id: 'dashboard', name: t('nav.dashboard'), path: '/' },
      { id: 'tasks', name: t('nav.tasks'), path: '/tasks' },
      { id: 'tasks-board', name: t('nav.board'), path: '/tasks/board' },
      { id: 'tasks-calendar', name: t('nav.calendar'), path: '/tasks/calendar' },
    ],
    enabled: open,
  });

  const onSelect = (cb: () => void) => {
    cb();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden">
        <Command label={t('titles.commandPalette')} loop>
          <Command.Input
            autoFocus
            placeholder={t('placeholders.commandSearch')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <Command.List>
            <Command.Empty>{t('messages.noResults')}</Command.Empty>
            {viewsQuery.data && (
              <Command.Group heading={t('labels.views')}>
                {viewsQuery.data.map((v) => (
                  <Command.Item
                    key={v.id}
                    onSelect={() => onSelect(() => navigate(v.path))}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {v.name}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {tasksQuery.data?.items && (
              <Command.Group heading={t('nav.tasks')}>
                {tasksQuery.data.items.map((t: any) => (
                  <Command.Item
                    key={t.id}
                    onSelect={() => onSelect(() => navigate(`/tasks/${t.id}`))}
                    onMouseEnter={() =>
                      qc.prefetchQuery({
                        queryKey: ['task', t.id],
                        queryFn: () => getTask(t.id),
                      })
                    }
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {t.title}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {usersQuery.data?.items && (
              <Command.Group heading={t('labels.users')}>
                {usersQuery.data.items.map((u: any) => (
                  <Command.Item
                    key={u.id}
                    onSelect={() => onSelect(() => navigate(`/users/${u.id}`))}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {u.name}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {suppliersQuery.data?.items && (
              <Command.Group heading={t('labels.suppliers')}>
                {suppliersQuery.data.items.map((s: any) => (
                  <Command.Item
                    key={s.id}
                    onSelect={() => onSelect(() => navigate(`/suppliers/${s.id}`))}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {s.name}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}