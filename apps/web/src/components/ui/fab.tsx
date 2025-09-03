import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './button'
import { Icon, type IconName } from '@/lib/lucide-icon'

interface FABProps {
  onComment: () => void
  onAttachment: () => void
  onEmail: () => void
}

export default function FAB({ onComment, onAttachment, onEmail }: FABProps) {
  const [open, setOpen] = useState(false)
  const actions: { icon: IconName; handler: () => void; label: string }[] = [
    { icon: 'message-circle', handler: onComment, label: 'comment' },
    { icon: 'paperclip', handler: onAttachment, label: 'attachment' },
    { icon: 'mail', handler: onEmail, label: 'email' },
  ]
  return (
    <div className="relative">
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute bottom-14 right-0 flex flex-col gap-2"
          >
            {actions.map(a => (
              <li key={a.label}>
                <Button
                  size="icon"
                  variant="secondary"
                  aria-label={a.label}
                  onClick={() => {
                    a.handler()
                    setOpen(false)
                  }}
                >
                  <Icon name={a.icon} className="h-5 w-5" />
                </Button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <Button size="icon" aria-label="menu" onClick={() => setOpen(o => !o)}>
        <Icon name={open ? 'x' : 'plus'} className="h-5 w-5" />
      </Button>
    </div>
  )
}