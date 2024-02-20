import 'dotenv/config'

import * as anchor from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import saleIdl from 'battlepets-shared/idls/battlepets_public_sale.json'
import 'colors'

import { SOL_TOKEN_EXCHANGE_RATE } from '@/common/constants'
import { executeScript } from '@/utils/scriptUtils'
import { getConnection, getExplorerURLQueryString, multiSendTokens } from '@/utils/solanaUtils'

import type { BattlepetsPublicSale } from 'battlepets-shared/types/battlepets_public_sale'

const distributeSale = async (): Promise<void> => {
  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  if (!process.env.SALE_PROGRAM_ID) {
    throw new Error('Must set sale program ID!')
  }

  if (!process.env.TOKEN_ADDRESS) {
    throw new Error('Must set token address!')
  }

  const connection = getConnection()

  const publicSaleAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const provider = new anchor.AnchorProvider(connection, new NodeWallet(publicSaleAccount), {})
  anchor.setProvider(provider)

  const saleProgram = new anchor.Program(
    saleIdl as anchor.Idl as BattlepetsPublicSale,
    process.env.SALE_PROGRAM_ID,
    provider
  )

  const [salePda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from('global')], saleProgram.programId)

  const tokenPublicKey = new web3.PublicKey(process.env.TOKEN_ADDRESS)

  const explorerURLQueryString = getExplorerURLQueryString()

  const { open: isSaleOpen } = await saleProgram.account.saleState.fetch(salePda)

  if (isSaleOpen) {
    throw new Error('Sale must be closed before distribution!')
  }

  const tokenMint = await token.getMint(connection, tokenPublicKey)

  const saleAllocations = await saleProgram.account.saleAllocationState.all()

  const saleReceivers = saleAllocations.map(allocation => ({
    publicKey: allocation.account.contributor,
    amount: (Number(allocation.account.amount) / anchor.web3.LAMPORTS_PER_SOL) * SOL_TOKEN_EXCHANGE_RATE,
  }))

  const saleDistributionTransactionSignature = await multiSendTokens(
    connection,
    publicSaleAccount,
    tokenMint.address,
    saleReceivers
  )

  console.log(
    `Sale Distribution Token Transaction: https://explorer.solana.com/tx/${saleDistributionTransactionSignature}${explorerURLQueryString}`
      .green
  )
}

executeScript(distributeSale)
