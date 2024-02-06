import 'dotenv/config'

import * as anchor from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import 'colors'

import { executeScript } from '@/utils/scriptUtils'
import { getConnection, getURLCluster } from '@/utils/solanaUtils'

import saleIdl from './scriptsIdls/battlepets_public_sale.json'

const openSale = async (): Promise<void> => {
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

  const saleProgram = new anchor.Program(saleIdl as anchor.Idl, process.env.SALE_PROGRAM_ID, provider)

  const [salePda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from('global')], saleProgram.programId)

  const urlCluster = getURLCluster()

  const openSaleTransactionSignature = await saleProgram.methods
    .openSale()
    .accounts({
      sale: salePda,
      fundRaiser: fundRaiserAccount.publicKey,
    })
    .rpc()

  console.log(
    `Open Sale Transaction: https://explorer.solana.com/tx/${openSaleTransactionSignature}?cluster=${urlCluster}`.cyan
  )
}

executeScript(openSale)
