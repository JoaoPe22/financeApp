import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { env } from './env'

dayjs.extend(utc)
dayjs.extend(timezone)

// O servidor normalmente roda em UTC, mas "hoje" e "mês atual" precisam ser os
// do usuário — senão a API e o front (que já usa NEXT_PUBLIC_APPLICATION_TIMEZONE
// em apps/web/src/lib/dayjs.ts) discordam sobre qual é o mês corrente na virada.

// Instante atual já convertido para o fuso da aplicação
const agora = () => dayjs().tz(env.APPLICATION_TIMEZONE)

// Data de hoje no formato usado pelas colunas `date` do Postgres
const hoje = () => agora().format('YYYY-MM-DD')

export { agora, dayjs, hoje }
