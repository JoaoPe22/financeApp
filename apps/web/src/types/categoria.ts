import { z } from 'zod'

export const TIPOCATEGORIA = {
  RECEITA: 'RECEITA',
  DESPESA: 'DESPESA',
  INVESTIMENTO: 'INVESTIMENTO',
} as const

export const tipoCategoriaEnum = z.enum([
  TIPOCATEGORIA.RECEITA,
  TIPOCATEGORIA.DESPESA,
  TIPOCATEGORIA.INVESTIMENTO,
])

export type TipoCategoria = (typeof TIPOCATEGORIA)[keyof typeof TIPOCATEGORIA]

export interface Categoria {
  id: string
  nome: string
  tipo: TipoCategoria
  cor: string
  icone: string
}
