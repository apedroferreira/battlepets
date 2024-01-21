import 'dotenv/config'

import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import 'colors'

import { INITIAL_TOKEN_DISTRIBUTION, TOKEN_AMOUNT, TOKEN_DECIMALS } from 'common/constants'
import { TokenDistribution } from 'common/enums'
import { executeScript } from 'utils/scriptUtils'
import { getCluster, getConnection, getTokenAmount } from 'utils/solanaUtils'

const createToken = async (): Promise<void> => {
  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  const connection = getConnection()

  const ownerAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const cluster = getCluster()

  const tokenMint = await token.createMint(connection, ownerAccount, ownerAccount.publicKey, null, TOKEN_DECIMALS)

  console.log(`Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=${cluster}`.cyan)

  const ownerTokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    ownerAccount,
    tokenMint,
    ownerAccount.publicKey
  )

  console.log(
    `Owner Token Account: https://explorer.solana.com/address/${ownerTokenAccount.address}?cluster=${cluster}`.cyan
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
    `Mint Token Transaction: https://explorer.solana.com/tx/${mintTransactionSignature}?cluster=${cluster}`.cyan
  )

  const revokeMintAuthorityTransactionSignature = await token.setAuthority(
    connection,
    ownerAccount,
    tokenMint,
    ownerAccount.publicKey,
    token.AuthorityType.MintTokens,
    null
  )

  console.log(
    `Revoke Mint Authority Token Transaction: https://explorer.solana.com/tx/${revokeMintAuthorityTransactionSignature}?cluster=${cluster}`
      .cyan
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
    `Initial Distribution Token Transaction: https://explorer.solana.com/tx/${initialDistributionTransactionSignature}?cluster=${cluster}`
      .cyan
  )
}

executeScript(createToken)
