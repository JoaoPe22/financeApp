import { z } from 'zod'

export const TIPORENDA = {
  SALARIO: 'SALARIO',
  AUTONOMO: 'AUTONOMO',
  RENDIMENTO: 'RENDIMENTO',
  OUTRO: 'OUTRO',
} as const

export const tipoRendaEnum = z.enum([
  TIPORENDA.SALARIO,
  TIPORENDA.AUTONOMO,
  TIPORENDA.RENDIMENTO,
  TIPORENDA.OUTRO,
])

export type TipoRenda = (typeof TIPORENDA)[keyof typeof TIPORENDA]
