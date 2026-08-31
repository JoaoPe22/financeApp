import { Insight } from './insight'

export interface PontoHistoricoSaldo {
  mes: number
  ano: number
  saldo: number
}

export interface GastoPorCategoria {
  categoriaNome: string
  categoriaCor: string
  valor: number
}

export interface ParcelamentoResumo {
  descricao: string
  totalPago: number
  totalPendente: number
}

export interface DespesaPesada {
  descricao: string
  categoriaNome: string
  valor: number
}

export const TIPO_LEMBRETE = {
  DESPESA: 'DESPESA',
  PARCELA: 'PARCELA',
} as const

export type TipoLembrete = (typeof TIPO_LEMBRETE)[keyof typeof TIPO_LEMBRETE]

export interface Lembrete {
  id: string
  descricao: string
  valor: number
  dataVencimento: string
  tipo: TipoLembrete
}

export interface DashboardResponse {
  historicoSaldo: PontoHistoricoSaldo[]
  gastosPorCategoria: GastoPorCategoria[]
  parcelamentos: ParcelamentoResumo[]
  metaReserva: { totalReservado: number; meta: number } | null
  despesasPesadas: DespesaPesada[]
  receitaVsDespesa: {
    totalReceitas: number
    totalDespesas: number
    salario: number
  }
  lembretes: Lembrete[]
  avisos: Insight[]
}
