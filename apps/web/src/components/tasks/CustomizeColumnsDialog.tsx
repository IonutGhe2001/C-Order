import React from 'react';
import Modal from '../Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/lib/lucide-icon';
import { useTranslation } from 'react-i18next';

type ColumnConfig = { id: string; header: string };

interface CustomizeColumnsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: ColumnConfig[]; // default columns
  customColumns: ColumnConfig[];
  columnNames: Record<string, string>;
  onSave: (names: Record<string, string>, customCols: ColumnConfig[]) => void;
  onRemoveColumn?: (id: string) => void;
}

export default function CustomizeColumnsDialog({
  open,
  onOpenChange,
  columns,
  customColumns,
  columnNames,
  onSave,
  onRemoveColumn,
}: CustomizeColumnsDialogProps) {
  const { t } = useTranslation();
  const [names, setNames] = React.useState<Record<string, string>>(columnNames);
  const [custom, setCustom] = React.useState<ColumnConfig[]>(customColumns);

  React.useEffect(() => {
    setNames(columnNames);
  }, [columnNames]);

  React.useEffect(() => {
    setCustom(customColumns);
  }, [customColumns]);

  const handleAdd = () => {
    const id = `custom_${Date.now()}`;
    setCustom([
      ...custom,
      { id, header: t('labels.newColumn', { defaultValue: 'New column' }) },
    ]);
  };

  const handleRemove = (id: string) => {
    if (custom.some((c) => c.id === id)) {
      setCustom(custom.filter((c) => c.id !== id));
    } else {
      onRemoveColumn?.(id);
    }
    setNames((prev) => {
      const { [id]: _omit, ...rest } = prev;
      return rest;
    });
  };

  const allColumns: ColumnConfig[] = [...columns, ...custom];

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={t('labels.customizeColumns', { defaultValue: 'Customize columns' })}
    >
      <div className="space-y-4">
        {allColumns.map((col) => (
          <div key={col.id} className="flex items-center gap-2">
            <Input
              value={names[col.id] ?? col.header}
              onChange={(e) =>
                setNames({ ...names, [col.id]: e.target.value })
              }
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(col.id)}
              aria-label={t('buttons.delete', { defaultValue: 'Delete' })}
            >
              <Icon name="trash" className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={handleAdd}>
          {t('buttons.addColumn', { defaultValue: 'Add column' })}
        </Button>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('buttons.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            onClick={() => {
              onSave(names, custom);
              onOpenChange(false);
            }}
          >
            {t('buttons.save', { defaultValue: 'Save' })}
          </Button>
        </div>
      </div>
    </Modal>
  );
}