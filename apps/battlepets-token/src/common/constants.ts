import { TokenDistribution } from './enums'

export const TOKEN_DECIMALS = 9
export const TOKEN_AMOUNT = 10000000

export const TOKEN_NAME = 'BattlePets'
export const TOKEN_SYMBOL = 'BPETS'
export const TOKEN_DESCRIPTION = 'Official token for the BattlePets game.'

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
