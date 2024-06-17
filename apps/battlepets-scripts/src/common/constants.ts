import * as web3 from '@solana/web3.js'

import { Email, NFTSeries, TokenDistribution } from './enums'

export const CLUSTER: web3.Cluster | 'localnet' = (process.env.CLUSTER ?? 'localnet') as web3.Cluster | 'localnet'

export const TOKEN_DECIMALS = 9
export const TOKEN_AMOUNT = 100000000

export const TOKEN_NAME = 'Battlepets'
export const TOKEN_SYMBOL = 'BPETS'
export const TOKEN_DESCRIPTION =
  'Official token of the Battlepets game. Collect pet NFTs, battle and win rewards in a deck-builder, auto-battler mobile game on Solana!'

const PRESALE_TOKEN_ALLOCATION = 0.35
const NON_PRESALE_TOKEN_ALLOCATION = 1 - PRESALE_TOKEN_ALLOCATION

export const INITIAL_TOKEN_DISTRIBUTION: Record<
  TokenDistribution,
  { allocation: number; walletAddress: string | undefined }
> = {
  [TokenDistribution.AIRDROP]: {
    allocation: 0.05 / NON_PRESALE_TOKEN_ALLOCATION,
    walletAddress: process.env.AIRDROP_WALLET_ADDRESS,
  },
  [TokenDistribution.LIQUIDITY]: {
    allocation: 0.168 / NON_PRESALE_TOKEN_ALLOCATION,
    walletAddress: process.env.LIQUIDITY_WALLET_ADDRESS,
  },
  [TokenDistribution.DEVELOPMENT_AND_MARKETING]: {
    allocation: 0.182 / NON_PRESALE_TOKEN_ALLOCATION,
    walletAddress: process.env.DEVELOPMENT_AND_MARKETING_WALLET_ADDRESS,
  },
  [TokenDistribution.TEAM]: {
    allocation: 0.15 / NON_PRESALE_TOKEN_ALLOCATION,
    walletAddress: process.env.TEAM_WALLET_ADDRESS,
  },
  [TokenDistribution.RESERVE]: {
    allocation: 0.1 / NON_PRESALE_TOKEN_ALLOCATION,
    walletAddress: process.env.RESERVE_WALLET_ADDRESS,
  },
}

export const SOL_TOKEN_EXCHANGE_RATE = 12500

export const METAPLEX_FOUNDATION_RULE_SET_ADDRESS = 'eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9'

export const NFT_COLLECTION_NAME = 'Battlepets'
export const NFT_COLLECTION_DESCRIPTION =
  'Official NFT collection of Battlepets. Collect pet NFTs, battle and win rewards in a deck-builder, auto-battler mobile game on Solana!'

export const NFT_SERIES_NAMES = {
  [NFTSeries.SERIES_1]: 'Battlepets Series 1',
}

export const NFT_SYMBOL = 'BPETS'
export const NFT_SELLER_FEE_BASIS_POINTS = 5 // %

export const MASTER_NFTS = {
  '6-hoppy-biz-1': '9LEB8M64QRDVe39biphpBMypDvhf8Ry4GxZVanWzrjGP',
  '7-astro-mon-1': '6D2pG8ft3kv8poEppVK9VcGxhe6Vy2tWoyjmJQ3gDR6X',
  '10-glitch-sol-1': 'BSaa3eSFxtFrYVWsrKnNhp4u4zpHbargxZMNSnY9NUQW',
}

interface EmailData {
  subject: string
  tag: string
}

export const EMAILS: Record<Email, EmailData> = {
  'og-airdrop': {
    subject: 'Don’t miss the OG airdrop!',
    tag: 'Pre-launch',
  },
  airdrop: {
    subject: 'It’s Airdrop Time!',
    tag: 'Pre-launch',
  },
  'presale-date': {
    subject: 'Presale Date Confirmed!',
    tag: 'Pre-launch',
  },
  'squid-game': {
    subject: '🦑 Battlepets Squid Game!',
    tag: 'Pre-launch',
  },
}
