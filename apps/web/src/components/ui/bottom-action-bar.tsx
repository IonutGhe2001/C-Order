import { useEffect, useRef, useState } from 'react'
import { Button } from './button'
import { Icon, type IconName } from '@/lib/lucide-icon'
import { cn } from '@/lib/utils'

interface Action {
  icon: IconName
  label: string
  onClick: () => void
}

interface BottomActionBarProps {
  actions: Action[]
}

export default function BottomActionBar({ actions }: BottomActionBarProps) {
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      setHidden(current > lastScrollY.current)
      lastScrollY.current = current
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 border-t bg-background transition-transform duration-300',
        hidden && 'translate-y-full'
      )}
    >
      <ul className="flex justify-around py-2">
        {actions.map(action => (
          <li key={action.label}>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-1"
              onClick={action.onClick}
            >
              <Icon name={action.icon} className="h-5 w-5" />
              <span className="text-xs">{action.label}</span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
