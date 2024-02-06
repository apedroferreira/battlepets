import * as web3 from '@solana/web3.js'

export const getEndpoint = () => web3.clusterApiUrl('devnet')

export const encodePDASeed = (seed: string) => new TextEncoder().encode(seed)
