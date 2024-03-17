import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { createSignerFromKeypair, generateSigner, percentAmount } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import { BASE_URL } from 'battlepets-shared/constants'
import { getEndpoint } from 'battlepets-shared/utils/solanaUtils'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { CLUSTER, NFT_COLLECTION_DESCRIPTION, NFT_COLLECTION_NAME, NFT_SYMBOL } from '@/common/constants'
import { executeScript } from '@/utils/scriptUtils'
import { getExplorerURLQueryString, uploadMetadata } from '@/utils/solanaUtils'

const SELLER_FEE_BASIS_POINTS = 0

const createNFTCollection = async (): Promise<void> => {
  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  const ownerAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const explorerURLQueryString = getExplorerURLQueryString()

  const umi = createUmi(getEndpoint(CLUSTER))

  const mplTokenMetadataPlugin = mplTokenMetadata()
  umi.use(mplTokenMetadataPlugin)

  const umiKeypair = fromWeb3JsKeypair(ownerAccount)
  const umiSigner = createSignerFromKeypair(umi, umiKeypair)
  umi.identity = umiSigner
  umi.payer = umiSigner

  const collectionMint = generateSigner(umi)

  const metadataUri = await uploadMetadata(
    umi,
    'collection',
    {
      name: NFT_COLLECTION_NAME,
      symbol: NFT_SYMBOL,
      description: NFT_COLLECTION_DESCRIPTION,
      seller_fee_basis_points: SELLER_FEE_BASIS_POINTS,
      external_url: BASE_URL,
    },
    true
  )

  const { signature: createCollectionTransactionSignature } = await createNft(umi, {
    mint: collectionMint,
    authority: umiSigner,
    name: NFT_COLLECTION_NAME,
    symbol: NFT_SYMBOL,
    uri: metadataUri,
    sellerFeeBasisPoints: percentAmount(SELLER_FEE_BASIS_POINTS),
    isCollection: true,
  }).sendAndConfirm(umi)

  console.log(
    `Create NFT Collection Transaction: https://explorer.solana.com/tx/${bs58.encode(createCollectionTransactionSignature)}${explorerURLQueryString}`
      .cyan
  )

  console.log(
    `NFT Collection Mint: https://explorer.solana.com/address/${collectionMint.publicKey.toString()}${explorerURLQueryString}`
      .green
  )
}

executeScript(createNFTCollection)
