import * as web3 from '@solana/web3.js'

import { TOKEN_DECIMALS } from '@/common/constants'

export const getEndpoint = () => web3.clusterApiUrl('devnet')

export const getConnection = () =>
  new web3.Connection(getEndpoint(), {
    commitment: 'confirmed',
  })

export const getUploaderAddress = () => 'https://devnet.bundlr.network'

export const getUploaderProviderUrl = () => 'https://api.devnet.solana.com'

export const getURLCluster = () => 'devnet'

export const getTokenAmount = (amount: number) => Math.floor(amount * 10 ** TOKEN_DECIMALS)
