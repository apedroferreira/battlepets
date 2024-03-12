import * as web3 from '@solana/web3.js'

import { NFTSeries, TokenDistribution } from './enums'

export const CLUSTER: web3.Cluster | 'localnet' = (process.env.CLUSTER ?? 'localnet') as web3.Cluster | 'localnet'

export const TOKEN_DECIMALS = 9
export const TOKEN_AMOUNT = 100000000

export const TOKEN_NAME = 'Battlepets'
export const TOKEN_SYMBOL = 'BPETS'
export const TOKEN_DESCRIPTION = 'Official token of Battlepets.'

export const INITIAL_TOKEN_DISTRIBUTION: Record<
  TokenDistribution,
  { allocation: number; walletAddress: string | undefined }
> = {
  [TokenDistribution.PUBLIC_SALE]: { allocation: 0.35, walletAddress: process.env.PUBLIC_SALE_WALLET_ADDRESS },
  [TokenDistribution.AIRDROP]: { allocation: 0.05, walletAddress: process.env.AIRDROP_WALLET_ADDRESS },
  [TokenDistribution.LIQUIDITY]: { allocation: 0.168, walletAddress: process.env.LIQUIDITY_WALLET_ADDRESS },
  [TokenDistribution.DEVELOPMENT_AND_MARKETING]: {
    allocation: 0.182,
    walletAddress: process.env.DEVELOPMENT_AND_MARKETING_WALLET_ADDRESS,
  },
  [TokenDistribution.TEAM]: { allocation: 0.15, walletAddress: process.env.TEAM_WALLET_ADDRESS },
  [TokenDistribution.RESERVE]: { allocation: 0.1, walletAddress: process.env.RESERVE_WALLET_ADDRESS },
}

export const SOL_TOKEN_EXCHANGE_RATE = 12500

export const METAPLEX_FOUNDATION_RULE_SET_ADDRESS = 'eBJLFYPxJmMGKuFwpDWkzxZeUrad92kZRC5BJLpzyT9'

export const NFT_COLLECTION_NAME = 'Battlepets'
export const NFT_COLLECTION_DESCRIPTION = 'Official NFT collection of Battlepets.'

export const NFT_SERIES_NAMES = {
  [NFTSeries.SERIES_1]: 'Battlepets Series 1',
}

export const NFT_SYMBOL = 'BPETS'
export const NFT_SELLER_FEE_BASIS_POINTS = 5 // %

export const MASTER_NFTS = {
  '1-sgtbarkley-g-1st': '7XLsFrB7n9VUnpg95KG2Dz5q48PFWU3tMu7GKZYe1KK3',
}
