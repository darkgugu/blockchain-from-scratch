import type {
  ChainResponse,
  MineResponse,
  RegisterResponse,
  ResolveResponse,
  BalanceResponse,
  WalletResponse,
  TamperResponse,
} from './types'

const proxy = (port: number, path: string) => `/api/proxy/${port}/${path}`

export async function getChain(port: number): Promise<ChainResponse> {
  const res = await fetch(proxy(port, 'chain'), { cache: 'no-store' })
  if (!res.ok) throw new Error(`GET /chain failed: ${res.status}`)
  return res.json()
}

export async function postTransaction(
  port: number,
  sender: string,
  receiver: string,
  amount: number
): Promise<{ message: string }> {
  const res = await fetch(proxy(port, 'transaction/new'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender, receiver, amount }),
  })
  if (!res.ok) throw new Error(`POST /transaction/new failed: ${res.status}`)
  return res.json()
}

export async function mine(port: number): Promise<MineResponse> {
  const res = await fetch(proxy(port, 'mine'), { cache: 'no-store' })
  if (!res.ok) throw new Error(`GET /mine failed: ${res.status}`)
  return res.json()
}

export async function registerNodes(
  port: number,
  nodes: string[]
): Promise<RegisterResponse> {
  const res = await fetch(proxy(port, 'nodes/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes }),
  })
  if (!res.ok) throw new Error(`POST /nodes/register failed: ${res.status}`)
  return res.json()
}

export async function resolveConflicts(port: number): Promise<ResolveResponse> {
  const res = await fetch(proxy(port, 'nodes/resolve'), { cache: 'no-store' })
  if (!res.ok) throw new Error(`GET /nodes/resolve failed: ${res.status}`)
  return res.json()
}

export async function getBalance(
  port: number,
  address: string
): Promise<BalanceResponse> {
  const res = await fetch(proxy(port, `balance?address=${encodeURIComponent(address)}`), {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GET /balance failed: ${res.status}`)
  return res.json()
}

export async function createWallet(port: number): Promise<WalletResponse> {
  const res = await fetch(proxy(port, 'wallet/new'), { cache: 'no-store' })
  if (!res.ok) throw new Error(`GET /wallet/new failed: ${res.status}`)
  return res.json()
}

export async function getWalletBalance(
  port: number,
  publicKey: string
): Promise<BalanceResponse> {
  const res = await fetch(
    proxy(port, `wallet/balance?public_key=${encodeURIComponent(publicKey)}`),
    { cache: 'no-store' }
  )
  if (!res.ok) throw new Error(`GET /wallet/balance failed: ${res.status}`)
  return res.json()
}

export async function tamperBlock(port: number): Promise<TamperResponse> {
  const res = await fetch(proxy(port, 'debug/tamper'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`POST /debug/tamper failed: ${res.status}`)
  return res.json()
}
