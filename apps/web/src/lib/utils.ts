import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Combina classes condicionais (clsx) e resolve conflitos do Tailwind (twMerge) —
// usado em todo componente de UI para permitir sobrescrever classes via `className`
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
