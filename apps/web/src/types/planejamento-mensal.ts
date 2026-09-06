import { FormaPagamento } from './conta-bancaria'

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
  formaPagamento: FormaPagamento | null
  contaBancariaId: string | null
  contaBancariaNome: string | null
  observacao: string | null
}

export interface Receita {
  id: string
  categoriaId: string
  categoriaNome: string
  categoriaCor: string
  descricao: string
  valorBruto: number | null
  valorLiquido: number
  dataRecebimento: string
  observacao: string | null
}

export interface ParcelaMensal {
  id: string
  parcelamentoId: string
  categoriaId: string
  categoriaNome: string
  categoriaCor: string
  descricao: string
  numero: number
  quantidadeParcelas: number
  valor: number
  dataVencimento: string
  status: StatusDespesaMensal
  dataPagamento: string | null
}

export interface PlanejamentoMensalResponse {
  planejamento: Planejamento | null
  despesas: DespesaMensal[]
  receitas: Receita[]
  parcelas: ParcelaMensal[]
}
