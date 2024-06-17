import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { TOKEN_AMOUNT, TOKEN_DECIMALS } from '@/common/constants'
import {} from '@/common/enums'
import { executeScript } from '@/utils/scriptUtils'
import { getConnection, getExplorerURLQueryString, getTokenAmount } from '@/utils/solanaUtils'

const createToken = async () => {
  if (!process.env.TOKEN_WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  const connection = getConnection()

  const ownerAccount = getKeypairFromEnvironment('TOKEN_WALLET_SECRET_KEY')

  const explorerURLQueryString = getExplorerURLQueryString()

  let tokenPublicKey = process.env.TOKEN_ADDRESS ? new web3.PublicKey(process.env.TOKEN_ADDRESS) : null
  if (!tokenPublicKey) {
    tokenPublicKey = await token.createMint(connection, ownerAccount, ownerAccount.publicKey, null, TOKEN_DECIMALS)

    console.log(
      `Token Mint: https://explorer.solana.com/address/${tokenPublicKey.toString()}${explorerURLQueryString}`.green
    )
  }

  const ownerTokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    ownerAccount,
    tokenPublicKey,
    ownerAccount.publicKey
  )

  const mintTransactionSignature = await token.mintTo(
    connection,
    ownerAccount,
    tokenPublicKey,
    ownerTokenAccount.address,
    ownerAccount,
    getTokenAmount(TOKEN_AMOUNT)
  )

  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${mintTransactionSignature}${explorerURLQueryString}`.green
  )
}

executeScript(createToken)
