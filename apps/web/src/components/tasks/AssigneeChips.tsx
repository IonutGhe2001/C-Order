import { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useTranslation } from 'react-i18next';

interface User { id: string; name: string; }

interface AssigneeChipsProps {
  users: User[];
  value: string[];
  onChange: (ids: string[]) => void;
}

function Chip({ id, name }: { id: string; name: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: reduceMotion ? undefined : transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="px-2 py-1 bg-gray-200 rounded cursor-move text-sm">
      {name}
    </div>
  );
}

export default function AssigneeChips({ users, value, onChange }: AssigneeChipsProps) {
  const [input, setInput] = useState('');
  const { t } = useTranslation();
  const selectedUsers = value.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];

  const addUser = () => {
    const u = users.find(u => u.name.toLowerCase() === input.toLowerCase());
    if (u && !value.includes(u.id)) {
      onChange([...value, u.id]);
      setInput('');
    }
  };

  return (
    <div className="space-y-2">
      <DndContext onDragEnd={(event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
          const oldIndex = value.indexOf(active.id as string);
          const newIndex = value.indexOf(over?.id as string);
          onChange(arrayMove(value, oldIndex, newIndex));
        }
      }}>
        <SortableContext items={value}>
          <div className="flex gap-2 flex-wrap">
            {selectedUsers.map(u => (
              <Chip key={u.id} id={u.id} name={u.name} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={t('placeholders.addAssignee')}
          className="h-8 text-sm"
        />
        <Button type="button" onClick={addUser} className="h-8 px-2 text-xs">{t('buttons.add')}</Button>
      </div>
    </div>
  );
}