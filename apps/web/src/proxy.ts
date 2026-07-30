import { headers } from 'next/headers'
import { type NextRequest, NextResponse, type ProxyConfig } from 'next/server'

import { auth } from '@/auth'

const publicRoutes = [
  {
    path: '/login',
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

const REDIRECT_WHEN_NOT_AUTHENTICATED = '/login'

export const proxy = async (request: NextRequest) => {
  const path = request.nextUrl.pathname
  const publicRoute = publicRoutes.find((route) => route.path === path)
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session && !publicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED
    return NextResponse.redirect(redirectUrl)
  }

  if (!session && publicRoute) {
    return NextResponse.next()
  }

  if (session && publicRoute && publicRoute.whenAuthenticated === 'redirect') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'

    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config: ProxyConfig = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
