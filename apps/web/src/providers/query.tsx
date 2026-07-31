// Configura o React Query (usado pelos hooks em src/hooks, ex.: useUsuarios).
// O retry só acontece para erros "temporários" (ver shouldRetry em
// src/lib/error-handler.ts) e para de tentar depois de poucas tentativas.
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { shouldRetry } from '@/lib/error-handler'

const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (failureCount >= 3) return false
              return shouldRetry(error)
            },
          },
          mutations: {
            retry: (failureCount, error) => {
              if (failureCount >= 2) return false
              return shouldRetry(error)
            },
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export { QueryProvider }
