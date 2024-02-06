import 'dotenv/config'

import yargs from 'yargs'
import 'colors'

import { executeScript } from '@/utils/scriptUtils'

const parser = yargs(process.argv.slice(2)).options({
  dateTime: { type: 'string' },
})

const getDateTimestamp = async (): Promise<void> => {
  const argv = parser.argv

  const { dateTime } = await argv

  if (!dateTime) {
    throw new Error('"dateTime" argument is required!')
  }

  const timestamp = new Date(dateTime).getTime()

  console.log(`${'Timestamp: '.cyan}${`${timestamp}`.green}`)
}

executeScript(getDateTimestamp)
