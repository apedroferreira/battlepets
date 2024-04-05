import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { fetchMetadata, findMetadataPda, updateMetadataAccountV2 } from '@metaplex-foundation/mpl-token-metadata'
import { createSignerFromKeypair } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters'
import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import { getEndpoint } from 'battlepets-shared/utils/solanaUtils'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { CLUSTER, TOKEN_DESCRIPTION, TOKEN_NAME, TOKEN_SYMBOL } from '@/common/constants'
import { executeScript } from '@/utils/scriptUtils'
import { getConnection, getExplorerURLQueryString, uploadMetadata } from '@/utils/solanaUtils'

const argv = yargs(process.argv.slice(2)).options({
  updateMetadataAccount: { type: 'boolean' },
  skipImageUpload: { type: 'boolean' },
  skipJsonUpload: { type: 'boolean' },
})

const updateTokenMetadata = async () => {
  const { skipImageUpload = false, skipJsonUpload = false, updateMetadataAccount = true } = await argv.parse()

  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  if (!process.env.TOKEN_ADDRESS) {
    throw new Error('Must set token address!')
  }

  const connection = getConnection()

  const ownerAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const tokenPublicKey = new web3.PublicKey(process.env.TOKEN_ADDRESS)

  const explorerURLQueryString = getExplorerURLQueryString()

  const tokenMint = await token.getMint(connection, tokenPublicKey)

  const umi = createUmi(getEndpoint(CLUSTER))

  const umiKeypair = fromWeb3JsKeypair(ownerAccount)
  const umiSigner = createSignerFromKeypair(umi, umiKeypair)
  umi.identity = umiSigner
  umi.payer = umiSigner

  const tokenMintAddress = tokenMint.address

  const tokenMetadataAccount = findMetadataPda(umi, { mint: fromWeb3JsPublicKey(tokenMintAddress) })

  const existingTokenMetadata = await fetchMetadata(umi, tokenMetadataAccount)

  const metadataUri = await uploadMetadata(
    umi,
    'token',
    {
      name: TOKEN_NAME,
      symbol: TOKEN_SYMBOL,
      description: TOKEN_DESCRIPTION,
    },
    false,
    existingTokenMetadata,
    skipImageUpload,
    skipJsonUpload
  )

  if (updateMetadataAccount) {
    const { signature: updateMetadataTransactionSignature } = await updateMetadataAccountV2(umi, {
      metadata: tokenMetadataAccount,
      updateAuthority: umiSigner,
      data: {
        name: TOKEN_NAME,
        symbol: TOKEN_SYMBOL,
        uri: metadataUri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      },
      isMutable: true,
    }).sendAndConfirm(umi)

    console.log(
      `Update Metadata Token Transaction: https://explorer.solana.com/tx/${bs58.encode(updateMetadataTransactionSignature)}${explorerURLQueryString}`
        .cyan
    )
  }

  console.log(
    `Updated Token Metadata: https://explorer.solana.com/address/${tokenMintAddress.toString()}/metadata${explorerURLQueryString}`
      .green
  )
}

executeScript(updateTokenMetadata)
