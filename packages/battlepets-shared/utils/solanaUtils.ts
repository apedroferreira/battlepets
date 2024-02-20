import * as web3 from '@solana/web3.js'

import { LOCALNET_ENDPOINT } from '../constants'

export const getEndpoint = (cluster: web3.Cluster | 'localnet') =>
  cluster === 'localnet' ? LOCALNET_ENDPOINT : web3.clusterApiUrl(cluster)
