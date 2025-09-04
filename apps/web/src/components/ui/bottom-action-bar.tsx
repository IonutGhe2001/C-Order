import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BottomActionBarProps {
  children: ReactNode
}

export default function BottomActionBar({ children }: BottomActionBarProps) {
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
        'fixed bottom-0 left-0 right-0 border-t bg-background transition-transform duration-300',
        hidden && 'translate-y-full'
      )}
    >
      <div className="flex justify-center py-2">{children}</div>
    </div>
  )
}
