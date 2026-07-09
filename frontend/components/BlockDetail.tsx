'use client'

import type { Block } from '@/lib/types'

interface BlockDetailProps {
  block: Block
  onClose: () => void
}

export default function BlockDetail({ block, onClose }: BlockDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl border border-border bg-bg-elevated/95 backdrop-blur-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-ink font-bold text-lg">
              {block.index === 0 ? 'Bloc Genesis' : `Bloc #${block.index}`}
            </h2>
            <p className="text-ink-muted text-xs mt-0.5">
              {new Date(parseFloat(block.timestamp) * 1000).toLocaleString('fr-FR')}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="text-ink-muted hover:text-ink text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <span className="text-xs text-ink-muted uppercase tracking-wide font-medium">Hash</span>
            <p className="text-primary font-mono break-all mt-1 text-xs">{block.hash}</p>
          </div>
          <div>
            <span className="text-xs text-ink-muted uppercase tracking-wide font-medium">Hash précédent</span>
            <p className="text-ink-secondary font-mono break-all mt-1 text-xs">{block.previous_hash}</p>
          </div>
          <div className="flex gap-6">
            <div>
              <span className="text-xs text-ink-muted uppercase tracking-wide font-medium">Nonce</span>
              <p className="text-ink font-mono font-bold mt-1">{block.nonce.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-xs text-ink-muted uppercase tracking-wide font-medium">Difficulté</span>
              <p className="text-ink font-mono font-bold mt-1">4</p>
            </div>
          </div>
          <div>
            <span className="text-xs text-ink-muted uppercase tracking-wide font-medium">
              Transactions ({block.transactions.length})
            </span>
            {block.transactions.length === 0 ? (
              <p className="text-ink-muted italic mt-2 text-xs">Aucune transaction</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {block.transactions.map((tx, i) => (
                  <li key={i} className="bg-white/5 border border-border rounded-lg p-2.5 font-mono text-xs">
                    <span className={tx.sender ? 'text-ink-secondary' : 'text-gold'}>{tx.sender ?? 'RÉCOMPENSE'}</span>
                    <span className="text-ink-muted"> → </span>
                    <span className="text-ink-secondary">{tx.receiver}</span>
                    <span className="text-gold ml-2 font-bold">{tx.amount} MSK</span>
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
