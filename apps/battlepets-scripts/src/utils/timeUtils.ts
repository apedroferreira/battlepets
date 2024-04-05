import { format } from 'date-fns'

export const convertTimestampToUnix = (timestamp: number) => timestamp / 1000

export const convertUnixToTimestamp = (unix: number) => unix * 1000

export const DEFAULT_DATE_FORMAT = 'd MMMM yyyy hh:mm:ss a'

export const defaultFormatDate = (timestamp: number) => format(timestamp, DEFAULT_DATE_FORMAT)
