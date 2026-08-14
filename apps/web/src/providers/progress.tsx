// Barra de progresso no topo da tela durante navegação (@bprogress/next) —
// ainda não está montado no layout raiz.
'use client'

import { AppProgressProvider } from '@bprogress/next'
import type { ReactNode } from 'react'

interface ProgressProviderProps {
  children: ReactNode
}

const ProgressProvider = ({ children }: ProgressProviderProps) => {
  return (
    <AppProgressProvider
      height="4px"
      color="var(--primary)"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </AppProgressProvider>
  )
}

export { ProgressProvider }
