import ky from 'ky'

import { env } from '@/lib/env'

const geoApi = ky.create({
  prefixUrl: env.NEXT_PUBLIC_GEO_API_URL,
})

export { geoApi }
