import 'dayjs/locale/pt-br'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { env } from './env'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)
dayjs.locale('pt-br')

const formatDate = (date: string | Date) => {
  const d =
    typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? dayjs.tz(date, 'YYYY-MM-DD', env.NEXT_PUBLIC_APPLICATION_TIMEZONE)
      : dayjs(date).tz(env.NEXT_PUBLIC_APPLICATION_TIMEZONE)
  return d.format('DD/MM/YYYY')
}

const formatDateTime = (date: string | Date) => {
  return dayjs(date)
    .tz(env.NEXT_PUBLIC_APPLICATION_TIMEZONE)
    .format('DD/MM/YYYY HH:mm:ss')
}

const formatDateTimeShort = (date: string | Date) => {
  return dayjs(date)
    .tz(env.NEXT_PUBLIC_APPLICATION_TIMEZONE)
    .format('DD/MM/YYYY HH:mm')
}

const parseDateOnly = (dateString: string) => {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ? dayjs.tz(dateString, 'YYYY-MM-DD', env.NEXT_PUBLIC_APPLICATION_TIMEZONE)
    : dayjs(dateString).tz(env.NEXT_PUBLIC_APPLICATION_TIMEZONE)

  return parsed.isValid() ? parsed.toDate() : null
}

const parseDateTime = (dateString: string) => {
  return dayjs.utc(dateString).tz(env.NEXT_PUBLIC_APPLICATION_TIMEZONE).toDate()
}

export {
  dayjs,
  formatDate,
  formatDateTime,
  formatDateTimeShort,
  parseDateOnly,
  parseDateTime,
}
