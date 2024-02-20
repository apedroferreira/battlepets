import 'dotenv/config'

import yargs from 'yargs'
import 'colors'

import { executeScript } from '@/utils/scriptUtils'

const argv = yargs(process.argv.slice(2)).options({
  dateTime: { type: 'string', demandOption: true },
})

const getDateTimestamp = async (): Promise<void> => {
  const { dateTime } = await argv.parse()

  const timestamp = new Date(dateTime).getTime()

  console.log(`${'Timestamp: '.cyan}${`${timestamp}`.green}`)
}

executeScript(getDateTimestamp)
