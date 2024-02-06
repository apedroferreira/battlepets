import 'dotenv/config'

import path from 'path'

import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import csvToJson from 'csvtojson'
import 'colors'

import { INITIAL_TOKEN_DISTRIBUTION, TOKEN_AMOUNT } from '@/common/constants'
import { TokenDistribution } from '@/common/enums'
import { executeScript } from '@/utils/scriptUtils'
import { getConnection, getTokenAmount, getURLCluster } from '@/utils/solanaUtils'

const sendAirdrop = async (): Promise<void> => {
  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  if (!process.env.TOKEN_ADDRESS) {
    throw new Error('Must set token address!')
  }

  const connection = getConnection()

  const senderAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const tokenPublicKey = new web3.PublicKey(process.env.TOKEN_ADDRESS)

  const urlCluster = getURLCluster()

  const tokenMint = await token.getMint(connection, tokenPublicKey)

  const senderTokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    senderAccount,
    tokenMint.address,
    senderAccount.publicKey
  )

  const airdropReceiversData = (await csvToJson().fromFile(
    path.resolve(__dirname, './scriptsData/airdropAddresses.csv')
  )) as { address: string }[]

  const validReceiverTokenAddresses: [web3.PublicKey, web3.PublicKey][] = await Promise.all(
    airdropReceiversData
      .map(airdropReceiverData => {
        const receiverAddress = airdropReceiverData.address

        if (!receiverAddress) {
          throw new Error('Missing receiver address!')
        }

        let receiverPublicKey = null
        try {
          receiverPublicKey = new web3.PublicKey(receiverAddress)
        } catch (error) {
          // Ignore invalid public keys
        }

        return receiverPublicKey
      })
      .filter(receiverPublicKey => receiverPublicKey && web3.PublicKey.isOnCurve(receiverPublicKey))
      .map(async receiverPublicKey => [
        receiverPublicKey!,
        await token.getAssociatedTokenAddress(tokenMint.address, receiverPublicKey!, false),
      ])
  )

  const airdropAmount = TOKEN_AMOUNT * INITIAL_TOKEN_DISTRIBUTION[TokenDistribution.AIRDROP].allocation
  const individualAirdropAmount = airdropAmount / validReceiverTokenAddresses.length

  let transaction = new web3.Transaction()
  for (const [receiverPublicKey, receiverTokenAddress] of validReceiverTokenAddresses) {
    const createTransferInstruction = token.createTransferInstruction(
      senderTokenAccount.address,
      receiverTokenAddress,
      senderAccount.publicKey,
      getTokenAmount(individualAirdropAmount)
    )

    const receiverTokenAccountInfo = await connection.getAccountInfo(receiverTokenAddress)

    if (receiverTokenAccountInfo) {
      transaction = transaction.add(createTransferInstruction)
    } else {
      transaction = transaction.add(
        token.createAssociatedTokenAccountInstruction(
          senderAccount.publicKey,
          receiverTokenAddress,
          receiverPublicKey,
          tokenMint.address
        ),
        createTransferInstruction
      )
    }
  }

  const transactionSignature = await web3.sendAndConfirmTransaction(connection, transaction, [senderAccount])

  console.log(
    `Airdrop Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=${urlCluster}`.cyan
  )
}

executeScript(sendAirdrop)
