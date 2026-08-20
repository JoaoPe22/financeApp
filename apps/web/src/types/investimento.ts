export interface Investimento {
  id: string
  categoriaId: string
  categoriaNome: string
  categoriaCor: string
  instituicaoFinanceira: string
  descricao: string
  valorAplicado: number
  rentabilidade: number
  indexador: string
  liquidez: string
  dataAplicacao: string
  dataVencimento: string
}
