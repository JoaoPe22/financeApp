import * as React from 'react'

// Faixa "tablet": do breakpoint mobile do sidebar (768px) até o próximo
// breakpoint do Tailwind (lg, 1024px) — abaixo disso o sidebar já vira
// overlay (offcanvas) sozinho, então essa faixa cobre só o meio-termo.
const TABLET_MIN_WIDTH = 768
const TABLET_MAX_WIDTH = 1023

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.innerWidth >= TABLET_MIN_WIDTH &&
      window.innerWidth <= TABLET_MAX_WIDTH
    )
  })

  React.useEffect(() => {
    const mql = window.matchMedia(
      `(min-width: ${TABLET_MIN_WIDTH}px) and (max-width: ${TABLET_MAX_WIDTH}px)`,
    )
    const onChange = () => setIsTablet(mql.matches)
    mql.addEventListener('change', onChange)
    onChange()
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isTablet
}
