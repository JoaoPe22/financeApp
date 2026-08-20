const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
})

const formatCurrency = (valor: number) => currencyFormatter.format(valor)

const formatPercent = (valor: number) => `${percentFormatter.format(valor)}%`

export { formatCurrency, formatPercent }
