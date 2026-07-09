'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { NodeSelector } from '@/components/NodeSelector'
import ChainViz from '@/components/ChainViz'
import MiningPanel from '@/components/MiningPanel'
import TxForm from '@/components/TxForm'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { getChain } from '@/lib/api'
import type { ChainResponse } from '@/lib/types'

export default function Home() {
  const [activePort, setActivePort] = useState(5001)
  const [chainData, setChainData] = useState<ChainResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const data = await getChain(activePort)
      setChainData(data)
    } catch {
      setChainData(null)
    } finally {
      setLoading(false)
    }
  }, [activePort])

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 3000)
    return () => clearInterval(id)
  }, [fetchStats])

  const blockCount = chainData?.chain.length ?? 0
  const lastBlock = chainData?.chain[chainData.chain.length - 1] ?? null
  const chainValid = chainData?.valid ?? true

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* ── Barre de navigation ── */}
      <header className="border-b border-border bg-bg/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Marque */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(47,111,238,0.4)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-ink leading-none">Blockchain</p>
              <p className="text-xs text-ink-secondary leading-none mt-0.5">ESGI M1 · Proof of Work</p>
            </div>
            <LiveIndicator />
          </div>

          {/* Sélecteur de nœud */}
          <NodeSelector activePort={activePort} onChange={setActivePort} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* ── Cartes de statistiques ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            }
            label="Blocs"
            value={blockCount}
            loading={loading}
          />
          <StatCard
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
            label="État de la chaîne"
            value={chainData ? (chainValid ? 'Valide' : 'Invalide') : '—'}
            valueClass={chainData ? (chainValid ? 'text-good' : 'text-critical') : 'text-ink-muted'}
            loading={loading}
          />
          <StatCard
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            label="Nœud actif"
            value={`Port ${activePort}`}
            loading={loading}
          />
          <StatCard
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
            label="Nonce du dernier bloc"
            value={lastBlock ? lastBlock.nonce.toLocaleString() : '—'}
            loading={loading}
          />
        </div>

        {/* ── Visualisation de la chaîne ── */}
        <GlassPanel glow className="overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">
              Chaîne — Nœud {activePort}
            </h2>
            {chainData && (
              <Badge status={chainValid ? 'good' : 'critical'}>
                {chainValid ? 'Valide' : 'INVALIDE'}
              </Badge>
            )}
          </div>
          <div className="p-4">
            <ChainViz port={activePort} />
          </div>
        </GlassPanel>

        {/* ── Contrôles : Transaction + Minage ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassPanel className="overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">
                Nouvelle transaction
              </h2>
            </div>
            <div className="p-4">
              <TxForm port={activePort} />
            </div>
          </GlassPanel>

          <GlassPanel className="overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">
                Minage
              </h2>
            </div>
            <div className="p-4">
              <MiningPanel port={activePort} />
            </div>
          </GlassPanel>
        </div>

        {/* ── Tableau des blocs récents ── */}
        {chainData && chainData.chain.length > 0 && (
          <GlassPanel className="overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">
                Blocs récents
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-ink-muted uppercase border-b border-border">
                    <th className="px-4 py-2 text-left font-medium">#</th>
                    <th className="px-4 py-2 text-left font-medium">Hash</th>
                    <th className="px-4 py-2 text-left font-medium">Nonce</th>
                    <th className="px-4 py-2 text-left font-medium">Transactions</th>
                    <th className="px-4 py-2 text-left font-medium">Horodatage</th>
                  </tr>
                </thead>
                <tbody>
                  {[...chainData.chain].reverse().slice(0, 8).map((block) => (
                    <tr key={block.index} className="border-b border-border/60 hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3 font-mono text-primary font-semibold">
                        {block.index === 0 ? 'Genesis' : `#${block.index}`}
                      </td>
                      <td className="px-4 py-3 font-mono text-ink-secondary text-xs" title={block.hash}>
                        {block.hash.slice(0, 20)}…
                      </td>
                      <td className="px-4 py-3 font-mono text-ink">{block.nonce.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary border border-primary/20">
                          {block.transactions.length} tx
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-muted text-xs">
                        {new Date(parseFloat(block.timestamp) * 1000).toLocaleTimeString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        )}
      </main>
    </div>
  )
}

function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-ink-secondary pl-1">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-good opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-good" />
      </span>
      Live
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  valueClass?: string
  loading?: boolean
}

function StatCard({ icon, label, value, valueClass = 'text-ink', loading = false }: StatCardProps) {
  return (
    <GlassPanel className="px-4 py-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 w-full">
        <p className="text-xs text-ink-muted uppercase tracking-wide font-medium">{label}</p>
        {loading ? (
          <Skeleton className="h-6 w-16 mt-1.5" />
        ) : (
          <motion.p
            key={String(value)}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-xl font-bold mt-0.5 truncate ${valueClass}`}
          >
            {value}
          </motion.p>
        )}
      </div>
    </GlassPanel>
  )
}
