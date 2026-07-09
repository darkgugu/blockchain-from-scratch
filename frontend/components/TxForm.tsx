'use client'

import { useState, useRef, useEffect } from 'react'
import { postTransaction } from '@/lib/api'
import { Button } from '@/components/ui/Button'

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
      setMessage('Transaction échouée — le nœud est-il lancé ?')
      setStatus('error')
    } finally {
      timeoutRef.current = setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const inputClass = "w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-ink text-sm placeholder-ink-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-colors"

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-ink-secondary mb-1 font-medium">Expéditeur</label>
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="alice"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-ink-secondary mb-1 font-medium">Destinataire</label>
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
        <label className="block text-xs text-ink-secondary mb-1 font-medium">Montant (MSK)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="10"
          min="1"
          className={inputClass}
        />
      </div>

      <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'} className="w-full">
        {status === 'loading' ? 'Envoi…' : 'Ajouter la transaction'}
      </Button>

      {status === 'success' && (
        <p className="text-good text-xs bg-good/10 border border-good/30 rounded p-2">{message}</p>
      )}
      {status === 'error' && (
        <p className="text-critical text-xs bg-critical/10 border border-critical/30 rounded p-2">{message}</p>
      )}
    </form>
  )
}
