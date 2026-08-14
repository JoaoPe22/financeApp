export const STATUS_DESPESA_MENSAL = {
  PENDENTE: 'PENDENTE',
  PAGA: 'PAGA',
  ATRASADA: 'ATRASADA',
} as const

export type StatusDespesaMensal =
  (typeof STATUS_DESPESA_MENSAL)[keyof typeof STATUS_DESPESA_MENSAL]

export interface Planejamento {
  id: string
  mes: number
  ano: number
  salarioPrevisto: number | null
  salarioRecebido: number | null
  status: string
}

export interface DespesaMensal {
  id: string
  categoriaId: string
  categoriaNome: string
  categoriaCor: string
  despesaFixaId: string | null
  descricao: string
  valor: number
  dataVencimento: string
  status: StatusDespesaMensal
  dataPagamento: string | null
  observacao: string | null
}

export interface PlanejamentoMensalResponse {
  planejamento: Planejamento | null
  despesas: DespesaMensal[]
}
