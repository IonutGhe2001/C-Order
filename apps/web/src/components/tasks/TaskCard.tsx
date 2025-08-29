import React from 'react';
import { Task, statusLabels } from './columns';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/lib/status-colors';
import { useQueryClient } from '@tanstack/react-query';
import { getTask } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/i18n';

interface Props {
  task: Task;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  onClick?: () => void;
}

export default function TaskCard({ task, selected, onSelectChange, onClick }: Props) {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return (
    <div
      className="border rounded-md p-4 mb-2 cursor-pointer hover:bg-brand-muted transition-colors duration-200 motion-reduce:transition-none"
      onClick={onClick}
      onMouseEnter={() =>
        qc.prefetchQuery({ queryKey: ['task', task.id], queryFn: () => getTask(task.id) })
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {onSelectChange && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelectChange(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <h3 className="font-semibold text-sm">{task.title}</h3>
        </div>
        <Badge variant={getStatusColor(task.status)}>
          {t(statusLabels[task.status] || `statuses.${task.status}`)}
        </Badge>
      </div>
      <div className="text-xs text-brand-fg mt-2 space-y-1">
        <p>
          {t('labels.priority')}: {t(`priority.${task.priority}`)}
        </p>
        {task.dueDate && (
          <p>
            {t('labels.dueDate')}: {formatDate(new Date(task.dueDate))}
          </p>
        )}
        {task.assignees?.length ? (
          <p>
            {t('labels.assignees')}: {task.assignees.map((a) => a.name).join(', ')}
          </p>
        ) : null}
      </div>
    </div>
  );
}