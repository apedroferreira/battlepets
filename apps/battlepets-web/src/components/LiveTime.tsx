import { useCallback, useEffect, useState } from 'react'

import { getTimeDifferenceFromNow } from '@/utils/timeUtils'

interface LiveTimeProps {
  timestamp: number
  showSeconds?: boolean
}

export const LiveTime: React.FC<LiveTimeProps> = ({ showSeconds = true, timestamp }) => {
  const getValue = useCallback(() => {
    const daysLeft = getTimeDifferenceFromNow(timestamp, 'days')
    const hoursLeft = getTimeDifferenceFromNow(timestamp, 'hours') - daysLeft * 24
    const minutesLeft = getTimeDifferenceFromNow(timestamp, 'minute') - daysLeft * 24 * 60 - hoursLeft * 60
    const secondsLeft =
      getTimeDifferenceFromNow(timestamp, 'second') - daysLeft * 24 * 60 * 60 - hoursLeft * 60 * 60 - minutesLeft * 60
    return `${daysLeft < 10 ? 0 : ''}${daysLeft >= 0 ? daysLeft : 0}d:${hoursLeft < 10 ? 0 : ''}${hoursLeft >= 0 ? hoursLeft : 0}h:${minutesLeft < 10 ? 0 : ''}${minutesLeft >= 0 ? minutesLeft : 0}m${
      showSeconds ? `:${secondsLeft < 10 ? 0 : ''}${secondsLeft >= 0 ? secondsLeft : 0}s` : ''
    }`
  }, [showSeconds, timestamp])

  const [value, setValue] = useState(getValue())

  useEffect(() => {
    setValue(getValue())
    const updateInterval = setInterval(() => {
      setValue(getValue())
    }, 1000)

    return () => clearInterval(updateInterval)
  }, [getValue])

  return <span>{value}</span>
}
