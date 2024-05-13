import * as web3 from '@solana/web3.js'
import { getRandomArrayElement } from 'battlepets-shared/utils/generalUtils'
import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

import { executeScript } from '@/utils/scriptUtils'
import { convertTimestampToUnix, convertUnixToTimestamp, defaultFormatDate } from '@/utils/timeUtils'

const METEORA_API_BASE_URL = 'https://dlmm-api.meteora.ag'
const SWAP_HISTORY_ROWS_TO_TAKE = 65000
const WRAPPED_SOL_TOKEN_ADDRESS = 'So11111111111111111111111111111111111111112'
const SOLSCAN_BASE_URL = 'https://solscan.io'

interface PairSwap {
  in_amount: number
  in_token: string
  out_amount: number
  out_token: string
  onchain_timestamp: number
  tx_id: string
}

const isSwapBuy = (swap: PairSwap) => swap.in_token === WRAPPED_SOL_TOKEN_ADDRESS

const argv = yargs(process.argv.slice(2)).options({
  fromTimestamp: { type: 'number' },
  toTimestamp: { type: 'number' },
  minBuyAmount: { type: 'number' },
})

const getSOLPairTradingStats = async () => {
  const { fromTimestamp = 0, minBuyAmount = 0, toTimestamp = Infinity } = await argv.parse()

  if (!process.env.TOKEN_SOL_PAIR_ADDRESS) {
    throw new Error('Must set token pair address!')
  }

  const pairSwapHistoryRequestSearchParams = new URLSearchParams({
    rows_to_take: String(SWAP_HISTORY_ROWS_TO_TAKE),
  })

  const pairSwapHistoryResponse = await fetch(
    `${METEORA_API_BASE_URL}/pair/${process.env.TOKEN_SOL_PAIR_ADDRESS}/analytic/swap_history?${pairSwapHistoryRequestSearchParams.toString()}`
  )
  const pairSwapHistory = (await pairSwapHistoryResponse.json()) as PairSwap[]

  const timeframeSwaps = pairSwapHistory.filter(
    swap =>
      swap.onchain_timestamp >= convertTimestampToUnix(fromTimestamp) &&
      swap.onchain_timestamp <= convertTimestampToUnix(toTimestamp)
  )

  const timeframeBuys = timeframeSwaps.filter(isSwapBuy)

  let longestBuyStreak: PairSwap[] = []
  let currentBuyStreak: PairSwap[] = []
  for (const swap of timeframeSwaps) {
    if (isSwapBuy(swap) && swap.in_amount / web3.LAMPORTS_PER_SOL >= minBuyAmount) {
      currentBuyStreak = [...currentBuyStreak, swap]
    } else {
      if (currentBuyStreak.length > longestBuyStreak.length) {
        longestBuyStreak = currentBuyStreak.slice()
      }
      currentBuyStreak = []
    }
  }
  if (currentBuyStreak.length > longestBuyStreak.length) {
    longestBuyStreak = currentBuyStreak.slice()
  }

  const biggestBuy = timeframeBuys.reduce(
    (acc, buy) => (buy.in_amount > acc.in_amount ? buy : acc),
    timeframeBuys[0] ?? null
  )

  const timeframeMinBuys = timeframeBuys.filter(buy => buy.in_amount / web3.LAMPORTS_PER_SOL >= minBuyAmount)
  const luckyBuy = getRandomArrayElement(timeframeMinBuys)

  if (timeframeBuys.length === 0) {
    console.log('No buys in the given timeframe!'.green)
  }

  if (longestBuyStreak) {
    console.log(`Longest Buy Streak: ${longestBuyStreak.length}`.green)
    for (let buyIndex = 0; buyIndex < longestBuyStreak.length; buyIndex++) {
      const buy = longestBuyStreak[buyIndex]
      console.log(
        `Streak Buy ${buyIndex + 1} (${buy.in_amount / web3.LAMPORTS_PER_SOL} SOL) (${defaultFormatDate(convertUnixToTimestamp(buy.onchain_timestamp))}): ${SOLSCAN_BASE_URL}/tx/${buy.tx_id}`
          .green
      )
    }
  }

  if (biggestBuy) {
    console.log(
      `Biggest Buy (${biggestBuy.in_amount / web3.LAMPORTS_PER_SOL} SOL) (${defaultFormatDate(convertUnixToTimestamp(biggestBuy.onchain_timestamp))}): ${SOLSCAN_BASE_URL}/tx/${biggestBuy.tx_id}`
        .green
    )
  }

  if (luckyBuy) {
    console.log(
      `Lucky Buy (${luckyBuy.in_amount / web3.LAMPORTS_PER_SOL} SOL) (${defaultFormatDate(convertUnixToTimestamp(luckyBuy.onchain_timestamp))}): ${SOLSCAN_BASE_URL}/tx/${luckyBuy.tx_id}`
        .green
    )
  }
}

executeScript(getSOLPairTradingStats)
