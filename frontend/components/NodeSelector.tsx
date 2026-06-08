'use client'

const NODES = [5001, 5002, 5003]

interface NodeSelectorProps {
  activePort: number
  onChange: (port: number) => void
}

export function NodeSelector({ activePort, onChange }: NodeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-lg p-1">
      {NODES.map((port) => (
        <button
          key={port}
          onClick={() => onChange(port)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activePort === port
              ? 'bg-orange-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          Node {port}
        </button>
      ))}
    </div>
  )
}
