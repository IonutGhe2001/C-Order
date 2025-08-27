import React from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { listTasks, listUsers, listSuppliers } from '@/lib/api';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

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
    queryKey: ['cp-views'],
    queryFn: async () => [
      { id: 'dashboard', name: 'Dashboard', path: '/' },
      { id: 'tasks', name: 'Tasks', path: '/tasks' },
      { id: 'tasks-board', name: 'Tasks Board', path: '/tasks-board' },
      { id: 'tasks-calendar', name: 'Tasks Calendar', path: '/tasks-calendar' },
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
        <Command label="Global Command Palette">
          <Command.Input placeholder="Type a command or search..." />
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>
            {viewsQuery.data && (
              <Command.Group heading="Views">
                {viewsQuery.data.map((v) => (
                  <Command.Item key={v.id} onSelect={() => onSelect(() => navigate(v.path))}>
                    {v.name}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {tasksQuery.data?.items && (
              <Command.Group heading="Tasks">
                {tasksQuery.data.items.map((t: any) => (
                  <Command.Item key={t.id} onSelect={() => onSelect(() => navigate(`/tasks/${t.id}`))}>
                    {t.title}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {usersQuery.data?.items && (
              <Command.Group heading="Users">
                {usersQuery.data.items.map((u: any) => (
                  <Command.Item key={u.id} onSelect={() => onSelect(() => navigate(`/users/${u.id}`))}>
                    {u.name}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {suppliersQuery.data?.items && (
              <Command.Group heading="Suppliers">
                {suppliersQuery.data.items.map((s: any) => (
                  <Command.Item key={s.id} onSelect={() => onSelect(() => navigate(`/suppliers/${s.id}`))}>
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