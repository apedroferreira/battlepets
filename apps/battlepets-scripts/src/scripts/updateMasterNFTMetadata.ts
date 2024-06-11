import fs from 'fs/promises'
import path from 'path'

import { JsonMetadata, fetchMetadataFromSeeds, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { createSignerFromKeypair, percentAmount, publicKey } from '@metaplex-foundation/umi'
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

import { CLUSTER, MASTER_NFTS, NFT_SELLER_FEE_BASIS_POINTS, NFT_SYMBOL } from '@/common/constants'
import { executeScript } from '@/utils/scriptUtils'
import { getExplorerURLQueryString, uploadMetadata } from '@/utils/solanaUtils'

import type { RequiredFields } from 'battlepets-shared/utils/typeUtils'

const argv = yargs(process.argv.slice(2)).options({
  id: { type: 'string', choices: Object.keys(MASTER_NFTS), demandOption: true },
  skipImageUpload: { type: 'boolean' },
  skipJsonUpload: { type: 'boolean' },
})

const updateMasterNFTMetadata = async () => {
  const { id, skipImageUpload = false, skipJsonUpload = false } = await argv.parse()

  if (!process.env.NFT_WALLET_SECRET_KEY) {
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

  const ownerAccount = getKeypairFromEnvironment('NFT_WALLET_SECRET_KEY')

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

  const jsonMetadata = {
    ...jsonFileMetadata,
    symbol: NFT_SYMBOL,
    seller_fee_basis_points: Number(percentAmount(NFT_SELLER_FEE_BASIS_POINTS).basisPoints),
    external_url: BASE_URL,
  }

  const existingMetadata = await fetchMetadataFromSeeds(umi, { mint: masterNFTPublicKey })

  await uploadMetadata(umi, id, jsonMetadata, true, existingMetadata, skipImageUpload, skipJsonUpload)

  console.log(
    `Updated Master NFT Metadata: https://explorer.solana.com/address/${masterNFTPublicKey.toString()}/metadata${explorerURLQueryString}`
      .green
  )
}

executeScript(updateMasterNFTMetadata)
