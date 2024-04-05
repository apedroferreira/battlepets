import yargs from 'yargs'
import 'colors'

// eslint-disable-next-line import/order
import { initializeEnv } from 'initializeEnv'
initializeEnv()

// eslint-disable-next-line import/order
import { executeScript } from '@/utils/scriptUtils'

const argv = yargs(process.argv.slice(2)).options({
  dateTime: { type: 'string', demandOption: true },
})

const getDateTimestamp = async () => {
  const { dateTime } = await argv.parse()

  const timestamp = new Date(dateTime).getTime()

  console.log(`${'Timestamp: '.cyan}${`${timestamp}`.green}`)
}

executeScript(getDateTimestamp)
