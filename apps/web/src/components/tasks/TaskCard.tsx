import React from 'react';
import { Task } from './columns';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { getStatusColor } from '@/lib/status-colors';
import { useQueryClient } from '@tanstack/react-query';
import { getTask } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/i18n';
import { getStatusLabels } from '@/lib/status-store';

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
      className={`rounded-lg p-4 cursor-pointer bg-background border transition-all shadow-sm hover:shadow-md hover:bg-brand-muted ${
        selected ? 'ring-2 ring-brand' : ''
      }`}
      aria-selected={selected}
      onClick={onClick}
      onMouseEnter={() =>
        qc.prefetchQuery({ queryKey: ['task', task.id], queryFn: () => getTask(task.id) })
      }
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {onSelectChange && (
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) => onSelectChange(!!checked)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <h3 className="font-semibold text-sm">{task.title}</h3>
          </div>
          <Badge variant={getStatusColor(task.status)}>
            {t(getStatusLabels()[task.status] || `statuses.${task.status}`)}
          </Badge>
        </div>
        <div className="text-xs text-foreground space-y-1">
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
    </div>
  );
}