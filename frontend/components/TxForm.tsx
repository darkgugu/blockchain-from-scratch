'use client'

import { useState, useRef, useEffect } from 'react'
import { postTransaction } from '@/lib/api'

interface TxFormProps {
  port: number
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function TxForm({ port }: TxFormProps) {
  const [sender, setSender] = useState('')
  const [receiver, setReceiver] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sender || !receiver || !amount) return

    setStatus('loading')
    try {
      const data = await postTransaction(port, sender, receiver, parseFloat(amount))
      setMessage(data.message)
      setStatus('success')
      setSender('')
      setReceiver('')
      setAmount('')
    } catch {
      setMessage('Transaction failed — is the node running?')
      setStatus('error')
    } finally {
      timeoutRef.current = setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 transition-colors"

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-medium">Sender</label>
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="alice"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-medium">Receiver</label>
          <input
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="bob"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1 font-medium">Amount (MSK)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="10"
          min="1"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-2.5 rounded-lg text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Sending…' : 'Add Transaction'}
      </button>

      {status === 'success' && (
        <p className="text-green-400 text-xs bg-green-950/50 border border-green-900/50 rounded p-2">{message}</p>
      )}
      {status === 'error' && (
        <p className="text-red-400 text-xs bg-red-950/50 border border-red-900/50 rounded p-2">{message}</p>
      )}
    </form>
  )
}
