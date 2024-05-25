import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import {
  TokenStandard,
  fetchMasterEditionFromSeeds,
  mplTokenMetadata,
  printV2,
  updateV1,
} from '@metaplex-foundation/mpl-token-metadata'
import {
  TransactionBuilder,
  TransactionSignature,
  createSignerFromKeypair,
  generateSigner,
  publicKey,
} from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import { pluralize } from 'battlepets-shared/utils/generalUtils'
import { getEndpoint } from 'battlepets-shared/utils/solanaUtils'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { CLUSTER, MASTER_NFTS, METAPLEX_FOUNDATION_RULE_SET_ADDRESS } from '@/common/constants'
import { executeScript } from '@/utils/scriptUtils'
import {
  getAirdropPendingReceivers,
  getExplorerURLQueryString,
  updateSuccessfulAirdropReceivers,
} from '@/utils/solanaUtils'

const MAX_AIRDROPS_PER_TRANSACTION = 2

const argv = yargs(process.argv.slice(2)).options({
  id: { type: 'string', choices: Object.keys(MASTER_NFTS), demandOption: true },
  fileName: { type: 'string', demandOption: true },
})

const sendNFTAirdrop = async () => {
  const { fileName, id } = await argv.parse()

  if (!process.env.WALLET_SECRET_KEY) {
    throw new Error('Must set secret key!')
  }

  const ownerAccount = getKeypairFromEnvironment('WALLET_SECRET_KEY')

  const explorerURLQueryString = getExplorerURLQueryString()

  const umi = createUmi(getEndpoint(CLUSTER))

  const mplTokenMetadataPlugin = mplTokenMetadata()
  umi.use(mplTokenMetadataPlugin)

  const umiKeypair = fromWeb3JsKeypair(ownerAccount)
  const umiSigner = createSignerFromKeypair(umi, umiKeypair)
  umi.identity = umiSigner
  umi.payer = umiSigner

  const masterNFTAddress = MASTER_NFTS[id as keyof typeof MASTER_NFTS]
  const masterNFTPublicKey = publicKey(masterNFTAddress)

  const masterEdition = await fetchMasterEditionFromSeeds(umi, {
    mint: masterNFTPublicKey,
  })

  const masterEditionSupply = Number(masterEdition.supply)

  const pendingReceivers = await getAirdropPendingReceivers(fileName)

  const firstCopyMint = generateSigner(umi)

  const nftAirdropTransactions: { transaction: TransactionBuilder; receiverAddresses: string[] }[] = []

  let currentTransactionIndex = 0
  for (let copyIndex = 0; copyIndex < pendingReceivers.length; copyIndex++) {
    const editionMint = copyIndex === 0 ? firstCopyMint : generateSigner(umi)

    const printNFTInstruction = printV2(umi, {
      masterTokenAccountOwner: umiSigner,
      masterEditionMint: masterNFTPublicKey,
      editionMint,
      editionTokenAccountOwner: fromWeb3JsPublicKey(pendingReceivers[copyIndex].publicKey),
      editionNumber: masterEditionSupply + copyIndex + 1,
      tokenStandard: TokenStandard.ProgrammableNonFungible,
    })

    const updateNFTPrimarySaleInstruction = updateV1(umi, {
      mint: editionMint.publicKey,
      primarySaleHappened: true,
      authorizationRules: publicKey(METAPLEX_FOUNDATION_RULE_SET_ADDRESS),
    })

    const currentTransaction = nftAirdropTransactions[currentTransactionIndex] ?? {
      transaction: new TransactionBuilder(),
      receiverAddresses: [],
    }
    nftAirdropTransactions[currentTransactionIndex] = {
      transaction: currentTransaction.transaction.add([printNFTInstruction, updateNFTPrimarySaleInstruction]),
      receiverAddresses: [...currentTransaction.receiverAddresses, pendingReceivers[copyIndex].publicKey.toString()],
    }

    if ((copyIndex + 1) % MAX_AIRDROPS_PER_TRANSACTION === 0) {
      currentTransactionIndex++
    }
  }

  let transactionResults: PromiseSettledResult<{
    result: { signature: TransactionSignature }
    receivers: { address: string; amount: number }[]
  }>[] = []
  try {
    for (const nftAirdropTransaction of nftAirdropTransactions) {
      const { receiverAddresses, transaction } = nftAirdropTransaction

      const transactionResult = await transaction.sendAndConfirm(umi)

      transactionResults = [
        ...transactionResults,
        {
          status: 'fulfilled',
          value: {
            result: transactionResult,
            receivers: receiverAddresses.map(address => ({
              address,
              amount: 1,
            })),
          },
        },
      ]
    }
  } catch (error) {
    transactionResults = [
      ...transactionResults,
      {
        status: 'rejected',
        reason: (error as Error).message,
      },
    ]
  }

  const { failedTransactionReasons, successfulTransactions } = await updateSuccessfulAirdropReceivers(
    fileName,
    transactionResults
  )

  const transactionCount = transactionResults.length
  const successfulTransactionCount = successfulTransactions.length
  const failedTransactionCount = transactionCount - successfulTransactionCount

  if (transactionCount > 0) {
    console.log(`NFT airdrop in ${pluralize(transactionCount, 'transaction')}:`.cyan)
  } else {
    console.log('No transactions to make!'.cyan)
  }

  if (successfulTransactionCount > 0) {
    console.log(`${pluralize(successfulTransactionCount, 'transaction')} successful.`.green)
  }
  if (failedTransactionCount > 0) {
    console.log(`${pluralize(failedTransactionCount, 'transaction')} failed.`.red)
    console.error(`${failedTransactionReasons[0]}`.red)
  }

  if (successfulTransactions.length > 0) {
    const [
      {
        result: { signature: nftAirdropFirstTransactionSignature },
      },
    ] = successfulTransactions

    console.log(
      `Airdrop NFT First Successful Transaction: https://explorer.solana.com/tx/${bs58.encode(nftAirdropFirstTransactionSignature)}${explorerURLQueryString}`
        .cyan
    )

    console.log(
      `First Successful Airdropped NFT Mint: https://explorer.solana.com/address/${firstCopyMint.publicKey.toString()}${explorerURLQueryString}`
        .green
    )
  }
}

executeScript(sendNFTAirdrop)
