import * as anchor from '@coral-xyz/anchor'
import * as web3 from '@solana/web3.js'

export const SOLANA_DECIMALS = 9
export const BPETS_DECIMALS = 9

export const SOL_BPETS_EXCHANGE_RATE = 12500

export const MIN_ALLOCATION_SOL_AMOUNT = 0.1
export const MAX_ALLOCATION_SOL_AMOUNT = 120

export const SOFT_CAP_SOL_AMOUNT = 700
export const HARD_CAP_SOL_AMOUNT = 2800

export const SALE_NAME = 'Battlepets Public Sale'

// Environment variables

export const CLUSTER: web3.Cluster | 'localnet' = (import.meta.env.VITE_CLUSTER ?? 'localnet') as
  | web3.Cluster
  | 'localnet'

export const SALE_PROGRAM_ID = new anchor.web3.PublicKey((import.meta.env.VITE_SALE_PROGRAM_ID as string) ?? '')

export const FUND_RAISER_PUBLIC_KEY = new anchor.web3.PublicKey(
  (import.meta.env.VITE_FUND_RAISER_ADDRESS as string) ?? ''
)

export const SALE_ENDS_AT_TIMESTAMP = Number(import.meta.env.VITE_SALE_ENDS_AT_TIMESTAMP)

export const HAS_PROCESSED_SALE_END = Boolean(import.meta.env.VITE_HAS_PROCESSED_SALE_END === 'true')

export const IS_STAGING = Boolean(import.meta.env.VITE_IS_STAGING === 'true')

export const SENTRY_DSN = (import.meta.env.VITE_SENTRY_DSN as string) ?? ''
export const SENTRY_ENVIRONMENT = IS_STAGING ? 'staging' : import.meta.env.MODE
