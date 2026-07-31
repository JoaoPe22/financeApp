// Middleware de autenticação (roda antes de toda página do Next.js).
// Responsabilidades:
// - Bloquear o acesso a rotas privadas para quem não está logado (redireciona para /sign-in)
// - Impedir que um usuário já logado acesse /sign-in ou /sign-up de novo (redireciona para /)
// - Deixar passar livremente as rotas de recuperação de senha, logado ou não

import { headers } from 'next/headers'
import { type NextRequest, NextResponse, type ProxyConfig } from 'next/server'

import { auth } from '@/auth'

// Rotas que não exigem sessão. `whenAuthenticated` decide o que fazer
// se o usuário JÁ estiver logado e tentar acessá-las:
// - 'redirect': manda para a Home (não faz sentido logar de novo ou recriar conta)
// - 'next': deixa acessar normalmente (ex.: trocar senha mesmo estando logado)
const publicRoutes = [
  {
    path: '/sign-in',
    whenAuthenticated: 'redirect',
  },
  {
    path: '/sign-up',
    whenAuthenticated: 'redirect',
  },
  {
    path: '/esqueci-a-senha',
    whenAuthenticated: 'next',
  },
  {
    path: '/redefinir-senha',
    whenAuthenticated: 'next',
  },
] as const

const REDIRECT_WHEN_NOT_AUTHENTICATED = '/sign-in'

export const proxy = async (request: NextRequest) => {
  const path = request.nextUrl.pathname
  const publicRoute = publicRoutes.find((route) => route.path === path)
  // Pergunta pro better-auth (via cookie da requisição) se existe sessão válida
  const session = await auth.api.getSession({ headers: await headers() })

  // Rota privada + sem sessão → chuta para o login
  if (!session && !publicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED
    return NextResponse.redirect(redirectUrl)
  }

  // Rota pública + sem sessão → segue o fluxo normalmente (ex.: preencher o login)
  if (!session && publicRoute) {
    return NextResponse.next()
  }

  // Já logado tentando acessar /sign-in ou /sign-up → manda para a Home
  if (session && publicRoute && publicRoute.whenAuthenticated === 'redirect') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'

    return NextResponse.redirect(redirectUrl)
  }

  // Logado + rota privada, ou logado + rota pública do tipo 'next' → segue
  return NextResponse.next()
}

export const config: ProxyConfig = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
