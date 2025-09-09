import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './ui/alert-dialog';

interface UnsavedChangesDialogProps {
  open: boolean;
  onStay: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

export default function UnsavedChangesDialog({
  open,
  onStay,
  onSave,
  onDiscard,
}: UnsavedChangesDialogProps) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('messages.unsavedChanges', { defaultValue: 'Unsaved changes' })}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStay}>
            {t('buttons.stay', { defaultValue: 'Stay' })}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onSave}>
            {t('buttons.save', { defaultValue: 'Save' })}
          </AlertDialogAction>
          <AlertDialogAction onClick={onDiscard} className="bg-danger text-white">
            {t('buttons.leaveWithoutSaving', { defaultValue: 'Leave without saving' })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}