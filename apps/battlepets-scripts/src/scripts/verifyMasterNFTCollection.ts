import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { findMetadataPda, mplTokenMetadata, verifyCollectionV1 } from '@metaplex-foundation/mpl-token-metadata'
import { createSignerFromKeypair, publicKey } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import { getEndpoint } from 'battlepets-shared/utils/solanaUtils'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { CLUSTER, MASTER_NFTS } from '@/common/constants'
import { executeScript } from '@/utils/scriptUtils'
import { getExplorerURLQueryString } from '@/utils/solanaUtils'

const argv = yargs(process.argv.slice(2)).options({
  id: { type: 'string', choices: Object.keys(MASTER_NFTS), demandOption: true },
})

const verifyMasterNFTCollection = async () => {
  const { id } = await argv.parse()

  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  if (!process.env.COLLECTION_ADDRESS) {
    throw new Error('Must set collection address!')
  }

  const ownerAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const collectionPublicKey = publicKey(process.env.COLLECTION_ADDRESS)

  const explorerURLQueryString = getExplorerURLQueryString()

  const umi = createUmi(getEndpoint(CLUSTER))

  const mplTokenMetadataPlugin = mplTokenMetadata()
  umi.use(mplTokenMetadataPlugin)

  const umiKeypair = fromWeb3JsKeypair(ownerAccount)
  const umiSigner = createSignerFromKeypair(umi, umiKeypair)
  umi.identity = umiSigner
  umi.payer = umiSigner

  const masterNFTAddress = MASTER_NFTS[id as keyof typeof MASTER_NFTS]
  const masterNFTPublicKey = publicKey(masterNFTAddress)

  const masterNFTMetadataAccount = findMetadataPda(umi, {
    mint: masterNFTPublicKey,
  })

  const { signature: verifyMasterNFTCollectionTransactionSignature } = await verifyCollectionV1(umi, {
    metadata: masterNFTMetadataAccount,
    collectionMint: collectionPublicKey,
    authority: umiSigner,
  }).sendAndConfirm(umi)

  console.log(
    `Verify Master NFT Collection Transaction: https://explorer.solana.com/tx/${bs58.encode(verifyMasterNFTCollectionTransactionSignature)}${explorerURLQueryString}`
      .cyan
  )

  console.log(
    `Verified Master NFT: https://explorer.solana.com/address/${masterNFTPublicKey.toString()}${explorerURLQueryString}`
      .green
  )
}

executeScript(verifyMasterNFTCollection)
