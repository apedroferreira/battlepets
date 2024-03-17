import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { executeScript } from '@/utils/scriptUtils'
import { getConnection, getExplorerURLQueryString } from '@/utils/solanaUtils'

const revokeMintAuthority = async (): Promise<void> => {
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

  const revokeMintAuthorityTransactionSignature = await token.setAuthority(
    connection,
    ownerAccount,
    tokenMint.address,
    ownerAccount.publicKey,
    token.AuthorityType.MintTokens,
    null
  )

  console.log(
    `Revoke Mint Authority Token Transaction: https://explorer.solana.com/tx/${revokeMintAuthorityTransactionSignature}${explorerURLQueryString}`
      .green
  )
}

executeScript(revokeMintAuthority)
