export interface Parcelamento {
  id: string
  categoriaId: string
  categoriaNome: string
  categoriaCor: string
  descricao: string
  valorTotal: number
  valorEntrada: number | null
  quantidadeParcelas: number
  parcelasPagas: number
  valorPago: number
  dataPrimeiraParcela: string
}

export interface Parcela {
  id: string
  numero: number
  valor: number
  status: string
  dataVencimento: string
  dataPagamento: string | null
}
