export const STATUS_OBJETIVO = {
  ATIVO: 'ATIVO',
  CONCLUIDO: 'CONCLUIDO',
  CANCELADO: 'CANCELADO',
} as const

export type StatusObjetivo =
  (typeof STATUS_OBJETIVO)[keyof typeof STATUS_OBJETIVO]

export interface Objetivo {
  id: string
  titulo: string
  descricao: string | null
  valorMeta: number
  valorAtual: number
  prazo: string
  status: StatusObjetivo
}
