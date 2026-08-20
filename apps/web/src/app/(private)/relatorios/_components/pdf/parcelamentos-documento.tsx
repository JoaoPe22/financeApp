import { Document, Page, View } from '@react-pdf/renderer'

import { Parcelamento } from '@/types/parcelamento'

import { CabecalhoRelatorio, RodapeRelatorio } from './cabecalho'
import { CardResumo } from './card-resumo'
import { formatCurrency } from './format'
import { styles } from './styles'
import { ColunaTabela, TabelaRelatorio } from './tabela'

interface ParcelamentosDocumentoProps {
  parcelamentos: Parcelamento[]
  nomeUsuario?: string | null
}

const colunas: ColunaTabela<Parcelamento>[] = [
  { cabecalho: 'Descrição', largura: '28%', render: (p) => p.descricao },
  { cabecalho: 'Categoria', largura: '18%', render: (p) => p.categoriaNome },
  {
    cabecalho: '1ª parcela',
    largura: '14%',
    render: (p) =>
      new Date(`${p.dataPrimeiraParcela}T00:00:00`).toLocaleDateString('pt-BR'),
  },
  {
    cabecalho: 'Progresso',
    largura: '12%',
    alinhamento: 'center',
    render: (p) => `${p.parcelasPagas}/${p.quantidadeParcelas}`,
  },
  {
    cabecalho: 'Entrada',
    largura: '14%',
    alinhamento: 'right',
    render: (p) => (p.valorEntrada ? formatCurrency(p.valorEntrada) : '-'),
  },
  {
    cabecalho: 'Valor total',
    largura: '14%',
    alinhamento: 'right',
    render: (p) => formatCurrency(p.valorTotal),
  },
]

const ParcelamentosDocumento = ({
  parcelamentos,
  nomeUsuario,
}: ParcelamentosDocumentoProps) => {
  const valorTotal = parcelamentos.reduce((soma, p) => soma + p.valorTotal, 0)
  const quitados = parcelamentos.filter(
    (p) => p.parcelasPagas >= p.quantidadeParcelas,
  ).length

  return (
    <Document title="Relatório de Parcelamentos" author="Relatórios">
      <Page size="A4" style={styles.pagina}>
        <CabecalhoRelatorio
          titulo="Relatório de Parcelamentos"
          nomeUsuario={nomeUsuario}
        />

        <View style={styles.resumoLinha}>
          <CardResumo label="Parcelamentos" valor={String(parcelamentos.length)} />
          <CardResumo label="Quitados" valor={String(quitados)} />
          <CardResumo
            label="Em andamento"
            valor={String(parcelamentos.length - quitados)}
          />
          <CardResumo label="Valor total" valor={formatCurrency(valorTotal)} />
        </View>

        <View style={styles.secao}>
          <TabelaRelatorio
            colunas={colunas}
            dados={parcelamentos}
            chave={(p) => p.id}
            vazio="Nenhum parcelamento cadastrado."
          />
        </View>

        <RodapeRelatorio />
      </Page>
    </Document>
  )
}

export { ParcelamentosDocumento }
