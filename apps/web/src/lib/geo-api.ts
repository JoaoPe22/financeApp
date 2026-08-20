import ky from 'ky'

import { env } from '@/lib/env'

// Client separado do apiClient: fala com uma API pública de estados/cidades
// (para os selects de endereço em src/services/geo.ts), não com o back-end
// deste projeto — por isso não usa credentials/cookie de sessão.
const geoApi = ky.create({
  prefixUrl: env.NEXT_PUBLIC_GEO_API_URL,
})

export { geoApi }
