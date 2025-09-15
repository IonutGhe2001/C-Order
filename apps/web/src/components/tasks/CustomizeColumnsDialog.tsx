import React from 'react';
import Modal from '../Modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';

type ColumnConfig = { id: string; header: string };

interface CustomizeColumnsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  available: ColumnConfig[];
  selected: string[];
  onSave: (ids: string[]) => void;
}

export default function CustomizeColumnsDialog({
  open,
  onOpenChange,
  available,
  selected,
  onSave,
}: CustomizeColumnsDialogProps) {
  const { t } = useTranslation();
  const [ids, setIds] = React.useState<string[]>(selected);

  React.useEffect(() => {
    setIds(selected);
  }, [selected]);

  const toggle = (id: string) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={t('labels.customizeColumns', { defaultValue: 'Customize columns' })}
    >
      <div className="space-y-4">
        {available.map((col) => (
          <div key={col.id} className="flex items-center gap-2">
            <Checkbox
              checked={ids.includes(col.id)}
              onCheckedChange={() => toggle(col.id)}
            />
            <span>{col.header}</span>
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('buttons.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            onClick={() => {
              onSave(ids);
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