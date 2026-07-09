'use client'

const NODES = [5001, 5002, 5003]

interface NodeSelectorProps {
  activePort: number
  onChange: (port: number) => void
}

export function NodeSelector({ activePort, onChange }: NodeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-white/5 border border-border rounded-lg p-1">
      {NODES.map((port) => (
        <button
          key={port}
          onClick={() => onChange(port)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activePort === port
              ? 'bg-primary text-white shadow-[0_0_16px_rgba(47,111,238,0.35)]'
              : 'text-ink-secondary hover:text-ink hover:bg-white/5'
          }`}
        >
          Nœud {port}
        </button>
      ))}
    </div>
  )
}
