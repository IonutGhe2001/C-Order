import React, { ReactNode } from 'react'
import { Button } from './ui/button'
import { Icon } from '../lib/lucide-icon'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from './ui/dialog'
import { useTranslation } from 'react-i18next'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <div className="flex items-center justify-between mb-4">
          <DialogTitle className={title ? undefined : 'sr-only'}>
            {title ?? 'Modal'}
          </DialogTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" aria-label={t('buttons.close')}>
                    <Icon name="x" className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </TooltipTrigger>
              <TooltipContent>{t('buttons.close')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  )
}