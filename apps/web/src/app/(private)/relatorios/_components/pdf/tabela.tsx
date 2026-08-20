import { Text, View } from '@react-pdf/renderer'

import { styles } from './styles'

// View/Text aqui não são elementos de DOM: são primitivos do @react-pdf/renderer,
// que percorre essa árvore de componentes e desenha um PDF de verdade (via
// yoga-layout, um motor de layout em WASM) em vez de renderizar HTML. Tabela
// genérica e reaproveitada por todos os *-documento.tsx desta pasta.

interface ColunaTabela<T> {
  cabecalho: string
  largura: string
  alinhamento?: 'left' | 'right' | 'center'
  render: (item: T) => string
}

interface TabelaRelatorioProps<T> {
  colunas: ColunaTabela<T>[]
  dados: T[]
  chave: (item: T) => string
  vazio?: string
}

function TabelaRelatorio<T>({
  colunas,
  dados,
  chave,
  vazio = 'Nenhum registro.',
}: TabelaRelatorioProps<T>) {
  return (
    <View style={styles.tabela}>
      <View style={[styles.linha, styles.linhaCabecalho]} fixed>
        {colunas.map((coluna) => (
          <Text
            key={coluna.cabecalho}
            style={[
              styles.celulaCabecalho,
              {
                width: coluna.largura,
                textAlign: coluna.alinhamento ?? 'left',
              },
            ]}
          >
            {coluna.cabecalho}
          </Text>
        ))}
      </View>

      {dados.length === 0 && <Text style={styles.vazio}>{vazio}</Text>}

      {dados.map((item, index) => (
        <View
          key={chave(item)}
          style={[
            styles.linha,
            index % 2 === 1 ? styles.linhaAlternada : undefined,
            index === dados.length - 1 ? { borderBottomWidth: 0 } : undefined,
          ]}
          wrap={false}
        >
          {colunas.map((coluna) => (
            <Text
              key={coluna.cabecalho}
              style={[
                styles.celula,
                {
                  width: coluna.largura,
                  textAlign: coluna.alinhamento ?? 'left',
                },
              ]}
            >
              {coluna.render(item)}
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}

export { TabelaRelatorio }
export type { ColunaTabela }
