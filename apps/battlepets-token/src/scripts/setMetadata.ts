import 'dotenv/config'

import fs from 'fs/promises'
import path from 'path'

import { createMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata'
import { createGenericFile, createSignerFromKeypair } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createBundlrUploader } from '@metaplex-foundation/umi-uploader-bundlr'
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters'
import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import bs58 from 'bs58'
import 'colors'

import { TOKEN_DESCRIPTION, TOKEN_NAME, TOKEN_SYMBOL } from '@/common/constants'
import { executeScript } from '@/utils/scriptUtils'
import {
  getConnection,
  getEndpoint,
  getURLCluster,
  getUploaderAddress,
  getUploaderProviderUrl,
} from '@/utils/solanaUtils'

const setMetadata = async (): Promise<void> => {
  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  if (!process.env.TOKEN_ADDRESS) {
    throw new Error('Must set token address!')
  }

  const connection = getConnection()

  const ownerAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const tokenPublicKey = new web3.PublicKey(process.env.TOKEN_ADDRESS)

  const urlCluster = getURLCluster()

  const tokenMint = await token.getMint(connection, tokenPublicKey)

  const umi = createUmi(getEndpoint())

  const umiKeypair = fromWeb3JsKeypair(ownerAccount)
  const umiSigner = createSignerFromKeypair(umi, umiKeypair)
  umi.identity = umiSigner
  umi.payer = umiSigner

  const uploader = createBundlrUploader(umi, {
    address: getUploaderAddress(),
    providerUrl: getUploaderProviderUrl(),
    timeout: 60000,
  })

  const tokenImageBuffer = await fs.readFile(path.resolve(__dirname, './scriptsAssets/token.png'))
  const tokenImageFile = createGenericFile(tokenImageBuffer, 'bpetstoken.png')

  const [imageUri] = await uploader.upload([tokenImageFile])

  console.log(`Token image uploaded to ${imageUri}`.cyan)

  const metadataUri = await uploader.uploadJson({
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    description: TOKEN_DESCRIPTION,
    image: imageUri,
  })

  console.log(`Metadata uploaded to ${metadataUri}`.cyan)

  const metadata = {
    mint: fromWeb3JsPublicKey(tokenMint.address),
    mintAuthority: umiSigner,
    payer: umiSigner,
    data: {
      name: TOKEN_NAME,
      symbol: TOKEN_SYMBOL,
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: false,
    collectionDetails: null,
  }

  const metadataInstruction = createMetadataAccountV3(umi, metadata)

  const metadataTransaction = await metadataInstruction.buildAndSign(umi)

  const metadataTransactionSignature = bs58.encode(await umi.rpc.sendTransaction(metadataTransaction))

  console.log(
    `Metadata Token Transaction: https://explorer.solana.com/tx/${metadataTransactionSignature}?cluster=${urlCluster}`
      .cyan
  )
}

executeScript(setMetadata)
