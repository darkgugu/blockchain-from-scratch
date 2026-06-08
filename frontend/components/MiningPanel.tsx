'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mine, tamperBlock, resolveConflicts } from '@/lib/api'
import type { MineResponse, TamperResponse } from '@/lib/types'

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
      setMineError('Minage échoué — nœud injoignable?')
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
      {/* Mine button */}
      <button
        onClick={handleMine}
        disabled={mining}
        className="w-full py-3 rounded-lg font-semibold text-sm bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {mining ? 'Mining…' : 'Mine Block'}
      </button>

      {/* Nonce animation / result */}
      <AnimatePresence mode="wait">
        {mining && (
          <motion.div
            key="mining"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg p-3 text-center border border-gray-700"
            style={{ background: '#1c1007' }}
          >
            <p className="text-gray-400 text-xs mb-1">Searching nonce…</p>
            <motion.p
              key={nonce}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-orange-400 font-mono text-xl font-bold"
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
            className="rounded-lg p-3 space-y-1 text-xs border border-gray-700"
            style={{ background: '#1c1007' }}
          >
            <p className="text-orange-400 font-semibold">Block #{minedBlock.index} mined!</p>
            <p className="text-gray-400">
              Nonce: <span className="text-white font-mono">{minedBlock.nonce}</span>
            </p>
            <p className="text-gray-400">
              Hash: <span className="text-orange-300 font-mono">{minedBlock.hash.slice(0, 20)}…</span>
            </p>
            <p className="text-gray-400">
              Transactions: <span className="text-white">{minedBlock.transactions.length}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {mineError && (
        <p className="text-red-300 text-xs bg-red-950/50 border border-red-900/50 rounded p-2">{mineError}</p>
      )}

      {/* Debug actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleTamper}
          className="py-2 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 border border-gray-600 text-red-400 hover:text-red-300 transition-colors"
        >
          Tamper Block
        </button>
        <button
          onClick={handleResolve}
          className="py-2 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 hover:text-white transition-colors"
        >
          Resolve Conflicts
        </button>
      </div>

      {tamperMsg && (
        <p className="text-red-300 text-xs bg-red-950/50 border border-red-900/50 rounded p-2">{tamperMsg}</p>
      )}
      {resolveMsg && (
        <p className="text-gray-300 text-xs bg-gray-800 border border-gray-700 rounded p-2">{resolveMsg}</p>
      )}
    </div>
  )
}
