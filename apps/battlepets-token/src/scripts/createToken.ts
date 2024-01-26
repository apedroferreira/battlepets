import 'dotenv/config'

import fs from 'fs/promises'
import path from 'path'

import { createMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata'
import { createGenericFile, createSignerFromKeypair, none } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createBundlrUploader } from '@metaplex-foundation/umi-uploader-bundlr'
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters'
import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import bs58 from 'bs58'
import 'colors'

import {
  INITIAL_TOKEN_DISTRIBUTION,
  TOKEN_AMOUNT,
  TOKEN_DECIMALS,
  TOKEN_DESCRIPTION,
  TOKEN_NAME,
  TOKEN_SYMBOL,
} from 'common/constants'
import { TokenDistribution } from 'common/enums'
import { executeScript } from 'utils/scriptUtils'
import {
  getConnection,
  getEndpoint,
  getTokenAmount,
  getURLCluster,
  getUploaderAddress,
  getUploaderProviderUrl,
} from 'utils/solanaUtils'

const createToken = async (): Promise<void> => {
  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  const connection = getConnection()

  const ownerAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const urlCluster = getURLCluster()

  const tokenMint = await token.createMint(connection, ownerAccount, ownerAccount.publicKey, null, TOKEN_DECIMALS)

  console.log(`Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=${urlCluster}`.cyan)

  const ownerTokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    ownerAccount,
    tokenMint,
    ownerAccount.publicKey
  )

  console.log(
    `Owner Token Account: https://explorer.solana.com/address/${ownerTokenAccount.address}?cluster=${urlCluster}`.cyan
  )

  const mintTransactionSignature = await token.mintTo(
    connection,
    ownerAccount,
    tokenMint,
    ownerTokenAccount.address,
    ownerAccount,
    getTokenAmount(TOKEN_AMOUNT)
  )

  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${mintTransactionSignature}?cluster=${urlCluster}`.cyan
  )

  const distributionWalletsTokenAddresses: [TokenDistribution, web3.PublicKey, web3.PublicKey][] = await Promise.all(
    Object.entries(INITIAL_TOKEN_DISTRIBUTION).map(
      async ([tokenDistribution, { walletAddress: tokenDistributionAddress }]) => {
        if (!tokenDistributionAddress) {
          throw new Error(`Missing token distribution address for ${tokenDistribution}!`)
        }

        const tokenDistributionPublicKey = new web3.PublicKey(tokenDistributionAddress)

        return [
          tokenDistribution as TokenDistribution,
          tokenDistributionPublicKey,
          await token.getAssociatedTokenAddress(tokenMint, tokenDistributionPublicKey!, false),
        ]
      }
    )
  )

  let initialDistributionTransaction = new web3.Transaction()
  for (const [
    tokenDistribution,
    tokenDistributionPublicKey,
    tokenDistributionTokenAddress,
  ] of distributionWalletsTokenAddresses) {
    const amount = TOKEN_AMOUNT * INITIAL_TOKEN_DISTRIBUTION[tokenDistribution].allocation

    const createTransferInstruction = token.createTransferInstruction(
      ownerTokenAccount.address,
      tokenDistributionTokenAddress,
      ownerAccount.publicKey,
      getTokenAmount(amount)
    )

    const receiverTokenAccountInfo = await connection.getAccountInfo(tokenDistributionTokenAddress)

    if (receiverTokenAccountInfo) {
      initialDistributionTransaction = initialDistributionTransaction.add(createTransferInstruction)
    } else {
      initialDistributionTransaction = initialDistributionTransaction.add(
        token.createAssociatedTokenAccountInstruction(
          ownerAccount.publicKey,
          tokenDistributionTokenAddress,
          tokenDistributionPublicKey,
          tokenMint
        ),
        createTransferInstruction
      )
    }
  }

  const initialDistributionTransactionSignature = await web3.sendAndConfirmTransaction(
    connection,
    initialDistributionTransaction,
    [ownerAccount]
  )

  console.log(
    `Initial Distribution Token Transaction: https://explorer.solana.com/tx/${initialDistributionTransactionSignature}?cluster=${urlCluster}`
      .cyan
  )
}

executeScript(createToken)
