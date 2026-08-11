import ky from 'ky'

import { env } from '@/lib/env'

const apiClient = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
  retry: 0,
})

export { apiClient }
