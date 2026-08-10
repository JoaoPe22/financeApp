// Instância do better-auth usada nos componentes client ('use client'):
// login, cadastro, leitura da sessão (useSession) e logout.
// Ela fala com o back-end através das rotas expostas em src/app/api/[...all]/route.ts.
import { createAuthClient } from 'better-auth/react'

import { env } from '@/lib/env'

const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_BASE_URL,
})

export { authClient }
