export interface Reserva {
  id: string
  instituicao: string
  valor: number
  rentabilidade: number
}

export interface ReservaHistorico {
  id: string
  valor: number
  variacao: number
  observacao: string | null
  data: string
}
