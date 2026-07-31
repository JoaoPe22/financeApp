// Provider de tema claro/escuro (next-themes) — ainda não está montado no layout raiz.
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import * as React from 'react'

// export function ThemeProvider({
//   children,
//   ...props
// }: React.ComponentProps<typeof NextThemesProvider>) {
//   return <NextThemesProvider {...props}>{children}</NextThemesProvider>
// }

const ThemeProvider = ({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export { ThemeProvider }
