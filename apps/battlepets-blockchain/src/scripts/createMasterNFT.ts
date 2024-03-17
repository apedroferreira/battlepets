import fs from 'fs/promises'
import path from 'path'

import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import {
  JsonMetadata,
  createProgrammableNft,
  mplTokenMetadata,
  printSupply,
} from '@metaplex-foundation/mpl-token-metadata'
import { createSignerFromKeypair, generateSigner, percentAmount, publicKey, some } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import { BASE_URL } from 'battlepets-shared/constants'
import { getEndpoint } from 'battlepets-shared/utils/solanaUtils'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import {
  CLUSTER,
  METAPLEX_FOUNDATION_RULE_SET_ADDRESS,
  NFT_COLLECTION_NAME,
  NFT_SELLER_FEE_BASIS_POINTS,
  NFT_SERIES_NAMES,
  NFT_SYMBOL,
} from '@/common/constants'
import { NFTSeries } from '@/common/enums'
import { executeScript } from '@/utils/scriptUtils'
import { getExplorerURLQueryString, uploadMetadata } from '@/utils/solanaUtils'

import type { RequiredFields } from 'battlepets-shared/utils/typeUtils'

const argv = yargs(process.argv.slice(2)).options({
  id: { type: 'string', demandOption: true },
  series: { type: 'string', choices: Object.keys(NFT_SERIES_NAMES), demandOption: true },
  maxSupply: { type: 'number' },
})

const createMasterNFT = async (): Promise<void> => {
  const { id, maxSupply = Infinity, series } = await argv.parse()

  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  if (!process.env.COLLECTION_ADDRESS) {
    throw new Error('Must set collection address!')
  }

  const jsonFilePath = path.resolve(__dirname, `../assets/json/${id}.json`)

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const jsonFileMetadata = JSON.parse(await fs.readFile(jsonFilePath, 'utf8')) as RequiredFields<
    JsonMetadata,
    'name' | 'description'
  >

  if (!jsonFileMetadata.name) {
    throw new Error('JSON file metadata must include "name" property!')
  }
  if (!jsonFileMetadata.description) {
    throw new Error('JSON file metadata must include "description" property!')
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

  const masterNFTMint = generateSigner(umi)

  const jsonMetadata = {
    ...jsonFileMetadata,
    symbol: NFT_SYMBOL,
    seller_fee_basis_points: Number(percentAmount(NFT_SELLER_FEE_BASIS_POINTS).basisPoints),
    external_url: BASE_URL,
    collection: {
      name: NFT_SERIES_NAMES[series as NFTSeries],
      family: NFT_COLLECTION_NAME,
    },
  }

  const metadataUri = await uploadMetadata(umi, id, jsonMetadata, true)

  const { signature: createMasterNFTransactionSignature } = await createProgrammableNft(umi, {
    mint: masterNFTMint,
    authority: umiSigner,
    name: jsonMetadata.name,
    symbol: NFT_SYMBOL,
    uri: metadataUri,
    sellerFeeBasisPoints: percentAmount(NFT_SELLER_FEE_BASIS_POINTS),
    collection: some({ key: collectionPublicKey, verified: false }),
    uses: null,
    isMutable: true,
    printSupply: maxSupply === Infinity ? printSupply('Unlimited') : printSupply('Limited', [maxSupply]),
    ruleSet: publicKey(METAPLEX_FOUNDATION_RULE_SET_ADDRESS),
  }).sendAndConfirm(umi)

  console.log(
    `Create Master NFT Transaction: https://explorer.solana.com/tx/${bs58.encode(createMasterNFTransactionSignature)}${explorerURLQueryString}`
      .cyan
  )

  console.log(
    `Master NFT Mint: https://explorer.solana.com/address/${masterNFTMint.publicKey.toString()}${explorerURLQueryString}`
      .green
  )
}

executeScript(createMasterNFT)
