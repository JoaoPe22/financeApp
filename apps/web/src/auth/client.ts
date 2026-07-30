import { adminClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { env } from '@/lib/env'
import { ac, ADMIN, AUXILIAR, SUPERVISOR } from '@/projeto-saas/api/auth/permissions'

const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_BASE_URL,
  plugins: [
    adminClient({
      ac,
      roles: {
        ADMIN,
        SUPERVISOR,
        AUXILIAR,
      },
    }),
  ],
})

export { authClient }
