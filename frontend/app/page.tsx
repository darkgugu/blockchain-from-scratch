'use client'

import { useState, useEffect, useCallback } from 'react'
import { NodeSelector } from '@/components/NodeSelector'
import ChainViz from '@/components/ChainViz'
import MiningPanel from '@/components/MiningPanel'
import TxForm from '@/components/TxForm'
import { getChain } from '@/lib/api'
import type { ChainResponse } from '@/lib/types'

export default function Home() {
  const [activePort, setActivePort] = useState(5001)
  const [chainData, setChainData] = useState<ChainResponse | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const data = await getChain(activePort)
      setChainData(data)
    } catch {
      setChainData(null)
    }
  }, [activePort])

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 3000)
    return () => clearInterval(id)
  }, [fetchStats])

  const blockCount = chainData?.chain.length ?? 0
  const lastBlock = chainData?.chain[chainData.chain.length - 1] ?? null
  const pendingTx = lastBlock?.transactions.length ?? 0
  const chainValid = chainData?.valid ?? true

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Top navigation bar ── */}
      <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">Blockchain</p>
              <p className="text-xs text-gray-400 leading-none mt-0.5">ESGI M1 · Proof of Work</p>
            </div>
          </div>

          {/* Node selector (right side) */}
          <NodeSelector activePort={activePort} onChange={setActivePort} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            }
            label="Blocks"
            value={blockCount}
          />
          <StatCard
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
            label="Chain status"
            value={chainData ? (chainValid ? 'Valid' : 'Invalid') : '—'}
            valueClass={chainData ? (chainValid ? 'text-green-400' : 'text-red-400') : 'text-gray-400'}
          />
          <StatCard
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            label="Active node"
            value={`Port ${activePort}`}
          />
          <StatCard
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
            label="Last block nonce"
            value={lastBlock ? lastBlock.nonce.toLocaleString() : '—'}
          />
        </div>

        {/* ── Chain visualization ── */}
        <section className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Chain — Node {activePort}
            </h2>
            {chainData && (
              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                chainValid
                  ? 'bg-green-950 text-green-400 border border-green-800'
                  : 'bg-red-950 text-red-400 border border-red-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${chainValid ? 'bg-green-400' : 'bg-red-400'}`} />
                {chainValid ? 'Valide' : 'INVALIDE'}
              </span>
            )}
          </div>
          <div className="p-4">
            <ChainViz port={activePort} />
          </div>
        </section>

        {/* ── Controls: Transaction + Mining ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                New Transaction
              </h2>
            </div>
            <div className="p-4">
              <TxForm port={activePort} />
            </div>
          </section>

          <section className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Mining
              </h2>
            </div>
            <div className="p-4">
              <MiningPanel port={activePort} />
            </div>
          </section>
        </div>

        {/* ── Recent blocks table ── */}
        {chainData && chainData.chain.length > 0 && (
          <section className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Recent Blocks
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                    <th className="px-4 py-2 text-left font-medium">#</th>
                    <th className="px-4 py-2 text-left font-medium">Hash</th>
                    <th className="px-4 py-2 text-left font-medium">Nonce</th>
                    <th className="px-4 py-2 text-left font-medium">Transactions</th>
                    <th className="px-4 py-2 text-left font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {[...chainData.chain].reverse().slice(0, 8).map((block) => (
                    <tr key={block.index} className="border-b border-gray-800/60 hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-orange-400 font-semibold">
                        {block.index === 0 ? 'Genesis' : `#${block.index}`}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-400 text-xs">
                        {block.hash.slice(0, 20)}…
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-300">{block.nonce.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-orange-950 text-orange-400 border border-orange-900">
                          {block.transactions.length} tx
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(parseFloat(block.timestamp) * 1000).toLocaleTimeString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  valueClass?: string
}

function StatCard({ icon, label, value, valueClass = 'text-white' }: StatCardProps) {
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 px-4 py-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-600/30 flex items-center justify-center text-orange-400 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
        <p className={`text-xl font-bold mt-0.5 truncate ${valueClass}`}>{value}</p>
      </div>
    </div>
  )
}
