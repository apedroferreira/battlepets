import * as anchor from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import * as web3 from '@solana/web3.js'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import saleIdl from 'battlepets-shared/idls/battlepets_sale.json'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { executeScript } from '@/utils/scriptUtils'
import { getConnection, getExplorerURLQueryString } from '@/utils/solanaUtils'

import type { BattlepetsSale } from 'battlepets-shared/types/battlepets_sale'

const closeSale = async () => {
  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  if (!process.env.SALE_PROGRAM_ID) {
    throw new Error('Must set sale program ID!')
  }

  const connection = getConnection()

  const fundRaiserAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const provider = new anchor.AnchorProvider(connection, new NodeWallet(fundRaiserAccount), {})
  anchor.setProvider(provider)

  const saleProgram = new anchor.Program(saleIdl as anchor.Idl as BattlepetsSale, process.env.SALE_PROGRAM_ID, provider)

  const [salePda] = web3.PublicKey.findProgramAddressSync([Buffer.from('global')], saleProgram.programId)

  const explorerURLQueryString = getExplorerURLQueryString()

  const closeSaleTransactionSignature = await saleProgram.methods
    .closeSale()
    .accounts({
      sale: salePda,
      fundRaiser: fundRaiserAccount.publicKey,
    })
    .rpc()

  console.log(
    `Close Sale Transaction: https://explorer.solana.com/tx/${closeSaleTransactionSignature}${explorerURLQueryString}`
      .green
  )
}

executeScript(closeSale)
