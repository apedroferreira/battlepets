import { useCallback, useEffect, useState } from 'react'

import { getTimeDifferenceFromNow } from '@/utils/timeUtils'

interface LiveTimeProps {
  timestamp: number
}

export const LiveTime: React.FC<LiveTimeProps> = ({ timestamp }) => {
  const getValue = useCallback(() => {
    const hoursLeft = getTimeDifferenceFromNow(timestamp, 'hours')
    const minutesLeft = getTimeDifferenceFromNow(timestamp, 'minute') - hoursLeft * 60
    const secondsLeft = getTimeDifferenceFromNow(timestamp, 'second') - hoursLeft * 60 * 60 - minutesLeft * 60
    return `${hoursLeft < 10 ? 0 : ''}${hoursLeft >= 0 ? hoursLeft : 0}h:${minutesLeft < 10 ? 0 : ''}${minutesLeft >= 0 ? minutesLeft : 0}m:${
      secondsLeft < 10 ? 0 : ''
    }${secondsLeft >= 0 ? secondsLeft : 0}s`
  }, [timestamp])

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
