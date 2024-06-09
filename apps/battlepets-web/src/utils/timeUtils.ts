import dayjs from 'dayjs'

import type { OpUnitType, QUnitType } from 'dayjs'

export const getTimeDifferenceFromNow = (timestamp: number, unit = 'second' as QUnitType | OpUnitType | undefined) =>
  dayjs(timestamp).diff(dayjs(), unit)
