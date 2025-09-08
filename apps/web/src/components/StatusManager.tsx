import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { loadStatuses, addStatus, updateStatus, removeStatus } from '@/lib/status-store';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StatusManager({ open, onOpenChange }: Props) {
  const [statuses, setStatuses] = useState<string[]>(loadStatuses());
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newValue, setNewValue] = useState('');

  const reset = () => {
    setEditing(null);
    setEditValue('');
  };

  const handleAdd = () => {
    if (!newValue.trim()) return;
    const updated = addStatus(newValue.trim());
    setStatuses(updated);
    setNewValue('');
  };

  const handleSave = (name: string) => {
    if (!editValue.trim()) return;
    const updated = updateStatus(name, editValue.trim());
    setStatuses(updated);
    reset();
  };

  const handleDelete = (name: string) => {
    const updated = removeStatus(name);
    setStatuses(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Manage statuses</DialogTitle>
        <div className="space-y-2 mt-4">
          {statuses.map((s) => (
            <div key={s} className="flex items-center space-x-2">
              {editing === s ? (
                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1" />
              ) : (
                <span className="flex-1 text-left">{s}</span>
              )}
              {editing === s ? (
                <Button size="sm" onClick={() => handleSave(s)}>Save</Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditing(s);
                      setEditValue(s);
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(s)}>
                    Delete
                  </Button>
                </>
              )}
            </div>
          ))}
          <div className="flex items-center space-x-2 pt-2">
            <Input
              placeholder="New status"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAdd}>Add</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}