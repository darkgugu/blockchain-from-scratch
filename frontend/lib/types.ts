export interface Transaction {
  sender: string | null
  receiver: string
  amount: number
}

export interface Block {
  index: number
  timestamp: string
  transactions: Transaction[]
  nonce: number
  previous_hash: string
  hash: string
}

export interface ChainResponse {
  chain: Block[]
  length: number
  valid: boolean
}

export interface MineResponse {
  message: string
  index: number
  transactions: Transaction[]
  nonce: number
  previous_hash: string
  hash: string
}

export interface RegisterResponse {
  message: string
  total_nodes: string[]
}

export interface ResolveResponse {
  message: string
  chain?: Block[]
  new_chain?: Block[]
}

export interface BalanceResponse {
  address: string
  balance: number
}

export interface WalletResponse {
  public_key: string
}

export interface TamperResponse {
  message: string
  valid: boolean
}
