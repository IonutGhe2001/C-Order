import React from 'react';
import { Task, statusLabels } from './columns';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/lib/status-colors';

interface Props {
  task: Task;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  onClick?: () => void;
}

export default function TaskCard({ task, selected, onSelectChange, onClick }: Props) {
  return (
    <div
      className="border rounded-md p-4 mb-2 cursor-pointer hover:bg-gray-50"
      onClick={onClick}
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
        <Badge variant={getStatusColor(task.status)}>{
          statusLabels[task.status] || task.status
        }</Badge>
      </div>
      <div className="text-xs text-gray-600 mt-2 space-y-1">
        <p>Prioritate: {task.priority}</p>
        {task.dueDate && (
          <p>Termen: {new Date(task.dueDate).toLocaleDateString()}</p>
        )}
        {task.assignees?.length ? (
          <p>
            Responsabili: {task.assignees.map((a) => a.name).join(', ')}
          </p>
        ) : null}
      </div>
    </div>
  );
}