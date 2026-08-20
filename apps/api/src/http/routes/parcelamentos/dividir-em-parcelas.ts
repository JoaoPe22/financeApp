// Divide um valor em N parcelas SEM perder centavos: arredondar a divisão e
// repetir o mesmo valor N vezes faz a soma das parcelas divergir do total
// (R$ 2.500 em 12x fechava em R$ 2.499,96). O resíduo vai na última parcela.
const dividirEmParcelas = (valorTotal: number, quantidade: number) => {
  const totalEmCentavos = Math.round(valorTotal * 100)
  const parcelaEmCentavos = Math.floor(totalEmCentavos / quantidade)
  const residuo = totalEmCentavos - parcelaEmCentavos * quantidade

  return Array.from({ length: quantidade }, (_, indice) => {
    const centavos =
      indice === quantidade - 1
        ? parcelaEmCentavos + residuo
        : parcelaEmCentavos

    return centavos / 100
  })
}

export { dividirEmParcelas }
