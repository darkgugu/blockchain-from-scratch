'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mine, tamperBlock, resolveConflicts } from '@/lib/api'
import type { MineResponse, TamperResponse } from '@/lib/types'
import { Button } from '@/components/ui/Button'

interface MiningPanelProps {
  port: number
}

export default function MiningPanel({ port }: MiningPanelProps) {
  const [mining, setMining] = useState(false)
  const [minedBlock, setMinedBlock] = useState<MineResponse | null>(null)
  const [nonce, setNonce] = useState(0)
  const [mineError, setMineError] = useState<string | null>(null)
  const [tamperMsg, setTamperMsg] = useState<string | null>(null)
  const [resolveMsg, setResolveMsg] = useState<string | null>(null)

  async function handleMine() {
    setMining(true)
    setMinedBlock(null)
    setMineError(null)

    const interval = setInterval(() => {
      setNonce((n) => n + Math.floor(Math.random() * 500) + 100)
    }, 80)

    try {
      const block = await mine(port)
      setMinedBlock(block)
      setNonce(block.nonce)
    } catch {
      setMineError('Minage échoué — nœud injoignable ?')
    } finally {
      clearInterval(interval)
      setMining(false)
    }
  }

  async function handleTamper() {
    try {
      const data: TamperResponse = await tamperBlock(port)
      setTamperMsg(`${data.message} | Valide: ${data.valid}`)
    } catch {
      setTamperMsg('Erreur — nœud inaccessible')
    }
    setTimeout(() => setTamperMsg(null), 5000)
  }

  async function handleResolve() {
    try {
      const data = await resolveConflicts(port)
      setResolveMsg(data.message)
    } catch {
      setResolveMsg('Erreur — nœud inaccessible')
    }
    setTimeout(() => setResolveMsg(null), 4000)
  }

  return (
    <div className="space-y-4">
      {/* Bouton de minage */}
      <Button variant="primary" size="lg" onClick={handleMine} disabled={mining} className="w-full">
        {mining ? 'Minage…' : 'Miner un bloc'}
      </Button>

      {/* Animation du nonce / résultat */}
      <AnimatePresence mode="wait">
        {mining && (
          <motion.div
            key="mining"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg p-3 text-center border border-warning/30 bg-warning/10"
          >
            <p className="text-ink-secondary text-xs mb-1">Recherche du nonce…</p>
            <motion.p
              key={nonce}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-warning font-mono text-xl font-bold"
            >
              {nonce.toLocaleString()}
            </motion.p>
          </motion.div>
        )}

        {minedBlock && !mining && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg p-3 space-y-1 text-xs border border-good/30 bg-good/10"
          >
            <p className="text-good font-semibold">Bloc #{minedBlock.index} miné !</p>
            <p className="text-ink-secondary">
              Nonce : <span className="text-ink font-mono">{minedBlock.nonce}</span>
            </p>
            <p className="text-ink-secondary">
              Hash : <span className="text-primary font-mono" title={minedBlock.hash}>{minedBlock.hash.slice(0, 20)}…</span>
            </p>
            <p className="text-ink-secondary">
              Transactions : <span className="text-ink">{minedBlock.transactions.length}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {mineError && (
        <p className="text-critical text-xs bg-critical/10 border border-critical/30 rounded p-2">{mineError}</p>
      )}

      {/* Actions de débogage */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="danger" size="sm" onClick={handleTamper} className="w-full">
          Falsifier le bloc
        </Button>
        <Button variant="ghost" size="sm" onClick={handleResolve} className="w-full">
          Résoudre les conflits
        </Button>
      </div>

      {tamperMsg && (
        <p className="text-critical text-xs bg-critical/10 border border-critical/30 rounded p-2">{tamperMsg}</p>
      )}
      {resolveMsg && (
        <p className="text-ink-secondary text-xs bg-white/5 border border-border rounded p-2">{resolveMsg}</p>
      )}
    </div>
  )
}
