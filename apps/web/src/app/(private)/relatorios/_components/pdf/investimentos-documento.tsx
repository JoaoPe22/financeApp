import { Document, Page, Text, View } from '@react-pdf/renderer'

import { Investimento } from '@/types/investimento'
import { Objetivo } from '@/types/objetivo'
import { Reserva } from '@/types/reserva'

import { CabecalhoRelatorio, RodapeRelatorio } from './cabecalho'
import { CardResumo } from './card-resumo'
import { formatCurrency, formatPercent } from './format'
import { styles } from './styles'
import { ColunaTabela, TabelaRelatorio } from './tabela'

interface InvestimentosDocumentoProps {
  investimentos: Investimento[]
  objetivos: Objetivo[]
  reservas: Reserva[]
  nomeUsuario?: string | null
}

const colunasInvestimentos: ColunaTabela<Investimento>[] = [
  { cabecalho: 'Descrição', largura: '22%', render: (i) => i.descricao },
  { cabecalho: 'Instituição', largura: '18%', render: (i) => i.instituicaoFinanceira },
  { cabecalho: 'Indexador', largura: '14%', render: (i) => i.indexador },
  {
    cabecalho: 'Rentab.',
    largura: '10%',
    alinhamento: 'right',
    render: (i) => formatPercent(i.rentabilidade),
  },
  {
    cabecalho: 'Vencimento',
    largura: '14%',
    render: (i) => new Date(`${i.dataVencimento}T00:00:00`).toLocaleDateString('pt-BR'),
  },
  {
    cabecalho: 'Valor aplicado',
    largura: '22%',
    alinhamento: 'right',
    render: (i) => formatCurrency(i.valorAplicado),
  },
]

const colunasObjetivos: ColunaTabela<Objetivo>[] = [
  { cabecalho: 'Título', largura: '28%', render: (o) => o.titulo },
  {
    cabecalho: 'Prazo',
    largura: '14%',
    render: (o) => new Date(`${o.prazo}T00:00:00`).toLocaleDateString('pt-BR'),
  },
  { cabecalho: 'Status', largura: '14%', render: (o) => o.status },
  {
    cabecalho: 'Progresso',
    largura: '14%',
    alinhamento: 'center',
    render: (o) =>
      o.valorMeta > 0
        ? `${Math.min(100, Math.round((o.valorAtual / o.valorMeta) * 100))}%`
        : '-',
  },
  {
    cabecalho: 'Valor atual',
    largura: '15%',
    alinhamento: 'right',
    render: (o) => formatCurrency(o.valorAtual),
  },
  {
    cabecalho: 'Meta',
    largura: '15%',
    alinhamento: 'right',
    render: (o) => formatCurrency(o.valorMeta),
  },
]

const colunasReservas: ColunaTabela<Reserva>[] = [
  { cabecalho: 'Instituição', largura: '40%', render: (r) => r.instituicao },
  {
    cabecalho: 'Rentabilidade',
    largura: '30%',
    alinhamento: 'right',
    render: (r) => formatPercent(r.rentabilidade),
  },
  {
    cabecalho: 'Valor',
    largura: '30%',
    alinhamento: 'right',
    render: (r) => formatCurrency(r.valor),
  },
]

const InvestimentosDocumento = ({
  investimentos,
  objetivos,
  reservas,
  nomeUsuario,
}: InvestimentosDocumentoProps) => {
  const totalInvestido = investimentos.reduce((soma, i) => soma + i.valorAplicado, 0)
  const totalReservas = reservas.reduce((soma, r) => soma + r.valor, 0)
  const totalPatrimonio = totalInvestido + totalReservas

  return (
    <Document title="Relatório de Investimentos e Objetivos" author="Relatórios">
      <Page size="A4" style={styles.pagina}>
        <CabecalhoRelatorio
          titulo="Relatório de Investimentos e Objetivos"
          nomeUsuario={nomeUsuario}
        />

        <View style={styles.resumoLinha}>
          <CardResumo label="Investido" valor={formatCurrency(totalInvestido)} />
          <CardResumo label="Reservas" valor={formatCurrency(totalReservas)} />
          <CardResumo label="Patrimônio total" valor={formatCurrency(totalPatrimonio)} />
          <CardResumo label="Objetivos ativos" valor={String(objetivos.length)} />
        </View>

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Investimentos</Text>
          <TabelaRelatorio
            colunas={colunasInvestimentos}
            dados={investimentos}
            chave={(i) => i.id}
            vazio="Nenhum investimento cadastrado."
          />
        </View>

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Objetivos</Text>
          <TabelaRelatorio
            colunas={colunasObjetivos}
            dados={objetivos}
            chave={(o) => o.id}
            vazio="Nenhum objetivo cadastrado."
          />
        </View>

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Reservas</Text>
          <TabelaRelatorio
            colunas={colunasReservas}
            dados={reservas}
            chave={(r) => r.instituicao}
            vazio="Nenhuma reserva cadastrada."
          />
        </View>

        <RodapeRelatorio />
      </Page>
    </Document>
  )
}

export { InvestimentosDocumento }
