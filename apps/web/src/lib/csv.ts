type ColunaCsv<T> = {
  cabecalho: string
  valor: (item: T) => string | number | null | undefined
}

// Excel em pt-BR usa ';' como separador de lista e precisa do BOM para
// reconhecer UTF-8 — sem os dois, o arquivo abre numa coluna só e com acentos
// quebrados. Ponto e vírgula também evita conflito com a vírgula decimal.
const SEPARADOR = ';'
const BOM = '﻿'

const escapar = (valor: string | number | null | undefined) => {
  const texto = valor == null ? '' : String(valor)

  return /["\n\r;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

const paraCsv = <T>(colunas: ColunaCsv<T>[], linhas: T[]) =>
  [
    colunas.map((coluna) => escapar(coluna.cabecalho)).join(SEPARADOR),
    ...linhas.map((linha) =>
      colunas.map((coluna) => escapar(coluna.valor(linha))).join(SEPARADOR),
    ),
  ].join('\r\n')

const baixarCsv = <T>(
  nomeArquivo: string,
  colunas: ColunaCsv<T>[],
  linhas: T[],
) => {
  const blob = new Blob([BOM + paraCsv(colunas, linhas)], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = nomeArquivo
  link.click()

  URL.revokeObjectURL(url)
}

export { baixarCsv, paraCsv }
export type { ColunaCsv }
