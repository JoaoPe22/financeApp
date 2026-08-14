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

export interface Perfil {
  id: string
  userId: string
  dataNascimento: string
  cep: string
  estado: string
  cidade: string
  bairro: string
  logradouro: string
  numero: string
  complemento?: string | null
  tipoRenda: TipoRenda
  salarioFixo?: number | null
  createdAt: string
  updatedAt: string
}

export type TipoRenda = (typeof TIPORENDA)[keyof typeof TIPORENDA]
