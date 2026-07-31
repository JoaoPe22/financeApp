// Layout raiz do Next.js — envolve toda página com o QueryProvider (necessário para
// os hooks de React Query, ex.: useUsuarios) e o Toaster (toasts de sucesso/erro
// usados nas telas de login, cadastro e conta).
import './globals.css'

import { Outfit } from 'next/font/google'
import { Toaster } from 'sonner'

import { QueryProvider } from '@/providers/query'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${outfit.variable} bg-muted text-primary-foreground overflow-x-hidden antialiased`}
      >
        <QueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  )
}
