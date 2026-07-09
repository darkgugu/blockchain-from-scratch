import type { ReactNode } from 'react'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  glow?: boolean
}

export function GlassPanel({ children, className = '', glow = false }: GlassPanelProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-white/[0.03] backdrop-blur-xl ${
        glow ? 'shadow-[0_0_40px_rgba(47,111,238,0.08)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
