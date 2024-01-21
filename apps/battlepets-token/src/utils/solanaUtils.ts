import * as web3 from '@solana/web3.js'

import { TOKEN_DECIMALS } from 'common/constants'

export const getConnection = () =>
  new web3.Connection(web3.clusterApiUrl('devnet'), {
    commitment: 'confirmed',
  })

export const getCluster = () => 'devnet'

export const getTokenAmount = (amount: number) => Math.floor(amount * 10 ** TOKEN_DECIMALS)
