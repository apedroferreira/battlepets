import * as anchor from '@coral-xyz/anchor'

export const SOLANA_DECIMALS = 9
export const BPETS_DECIMALS = 9

export const SOL_BPETS_EXCHANGE_RATE = 800

export const MIN_ALLOCATION_SOL_AMOUNT = 0.1
export const MAX_ALLOCATION_SOL_AMOUNT = 4

export const SOFT_CAP_SOL_AMOUNT = 3
export const HARD_CAP_SOL_AMOUNT = 16

export const SALE_PROGRAM_ID = new anchor.web3.PublicKey((import.meta.env.VITE_SALE_PROGRAM_ID as string) ?? '')

export const FUND_RAISER_PUBLIC_KEY = new anchor.web3.PublicKey(
  (import.meta.env.VITE_FUND_RAISER_ADDRESS as string) ?? ''
)

export const SALE_ENDS_AT_TIMESTAMP = Number(import.meta.env.VITE_SALE_ENDS_AT_TIMESTAMP)

export const HOME_URL = 'https://battlepets.app'
