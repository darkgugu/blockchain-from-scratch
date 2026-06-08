'use client'

import type { Block } from '@/lib/types'

interface BlockDetailProps {
  block: Block
  onClose: () => void
}

export default function BlockDetail({ block, onClose }: BlockDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl border border-gray-700 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" style={{ background: '#1a0f0a' }}>
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-white font-bold text-lg">
              {block.index === 0 ? 'Genesis Block' : `Block #${block.index}`}
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {new Date(parseFloat(block.timestamp) * 1000).toLocaleString('fr-FR')}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="text-gray-500 hover:text-white text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Hash</span>
            <p className="text-orange-400 font-mono break-all mt-1 text-xs">{block.hash}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Previous Hash</span>
            <p className="text-gray-400 font-mono break-all mt-1 text-xs">{block.previous_hash}</p>
          </div>
          <div className="flex gap-6">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Nonce</span>
              <p className="text-white font-mono font-bold mt-1">{block.nonce.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Difficulty</span>
              <p className="text-white font-mono font-bold mt-1">4</p>
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Transactions ({block.transactions.length})
            </span>
            {block.transactions.length === 0 ? (
              <p className="text-gray-600 italic mt-2 text-xs">No transactions</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {block.transactions.map((tx, i) => (
                  <li key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-2.5 font-mono text-xs">
                    <span className="text-orange-400">{tx.sender ?? 'RÉCOMPENSE'}</span>
                    <span className="text-gray-600"> → </span>
                    <span className="text-gray-300">{tx.receiver}</span>
                    <span className="text-orange-300 ml-2 font-bold">{tx.amount} MSK</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
