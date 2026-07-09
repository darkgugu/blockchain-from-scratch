import type { ReactNode } from 'react'

type Status = 'good' | 'warning' | 'critical' | 'neutral'

interface BadgeProps {
  status: Status
  children: ReactNode
}

const STATUS_CLASSES: Record<Status, string> = {
  good: 'bg-good/10 text-good border-good/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  critical: 'bg-critical/10 text-critical border-critical/30',
  neutral: 'bg-white/5 text-ink-secondary border-border',
}

const DOT_CLASSES: Record<Status, string> = {
  good: 'bg-good',
  warning: 'bg-warning',
  critical: 'bg-critical',
  neutral: 'bg-ink-secondary',
}

export function Badge({ status, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_CLASSES[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_CLASSES[status]}`} />
      {children}
    </span>
  )
}
