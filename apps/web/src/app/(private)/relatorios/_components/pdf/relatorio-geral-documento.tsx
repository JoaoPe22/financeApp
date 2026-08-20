import { Document, Page, Text, View } from '@react-pdf/renderer'

import { MESES } from '@/components/mes-ano-select'
import { DashboardResponse } from '@/types/dashboard'
import { Investimento } from '@/types/investimento'
import { Objetivo } from '@/types/objetivo'
import { Parcelamento } from '@/types/parcelamento'
import { PlanejamentoMensalResponse } from '@/types/planejamento-mensal'
import { Reserva } from '@/types/reserva'

import { CabecalhoRelatorio, RodapeRelatorio } from './cabecalho'
import { CardResumo } from './card-resumo'
import { formatCurrency } from './format'
import { styles } from './styles'
import { ColunaTabela, TabelaRelatorio } from './tabela'

// O mais completo dos documentos desta pasta: junta num único PDF os dados já
// carregados pela página de relatórios (dashboard, planejamento mensal,
// parcelamentos, investimentos, objetivos e reservas) — não faz nenhuma
// chamada própria à API, só recebe tudo pronto via props.
interface RelatorioGeralDocumentoProps {
  mes: number
  ano: number
  dashboard: DashboardResponse
  planejamento: PlanejamentoMensalResponse
  parcelamentos: Parcelamento[]
  investimentos: Investimento[]
  objetivos: Objetivo[]
  reservas: Reserva[]
  nomeUsuario?: string | null
}

const colunasParcelamentos: ColunaTabela<Parcelamento>[] = [
  { cabecalho: 'Descrição', largura: '34%', render: (p) => p.descricao },
  { cabecalho: 'Categoria', largura: '22%', render: (p) => p.categoriaNome },
  {
    cabecalho: 'Progresso',
    largura: '16%',
    alinhamento: 'center',
    render: (p) => `${p.parcelasPagas}/${p.quantidadeParcelas}`,
  },
  {
    cabecalho: 'Valor total',
    largura: '28%',
    alinhamento: 'right',
    render: (p) => formatCurrency(p.valorTotal),
  },
]

const colunasInvestimentos: ColunaTabela<Investimento>[] = [
  { cabecalho: 'Descrição', largura: '30%', render: (i) => i.descricao },
  {
    cabecalho: 'Instituição',
    largura: '30%',
    render: (i) => i.instituicaoFinanceira,
  },
  {
    cabecalho: 'Valor aplicado',
    largura: '40%',
    alinhamento: 'right',
    render: (i) => formatCurrency(i.valorAplicado),
  },
]

const colunasObjetivos: ColunaTabela<Objetivo>[] = [
  { cabecalho: 'Título', largura: '34%', render: (o) => o.titulo },
  { cabecalho: 'Status', largura: '22%', render: (o) => o.status },
  {
    cabecalho: 'Valor atual',
    largura: '22%',
    alinhamento: 'right',
    render: (o) => formatCurrency(o.valorAtual),
  },
  {
    cabecalho: 'Meta',
    largura: '22%',
    alinhamento: 'right',
    render: (o) => formatCurrency(o.valorMeta),
  },
]

const RelatorioGeralDocumento = ({
  mes,
  ano,
  dashboard,
  planejamento,
  parcelamentos,
  investimentos,
  objetivos,
  reservas,
  nomeUsuario,
}: RelatorioGeralDocumentoProps) => {
  const { receitaVsDespesa, metaReserva } = dashboard
  const saldo = receitaVsDespesa.salario - receitaVsDespesa.totalDespesas
  const totalInvestido = investimentos.reduce(
    (soma, i) => soma + i.valorAplicado,
    0,
  )
  const totalReservas = reservas.reduce((soma, r) => soma + r.valor, 0)

  return (
    <Document title="Relatório Geral" author="Relatórios">
      <Page size="A4" style={styles.pagina}>
        <CabecalhoRelatorio
          titulo="Relatório Financeiro Geral"
          subtitulo={`Referente a ${MESES[mes - 1]} de ${ano}`}
          nomeUsuario={nomeUsuario}
        />

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Resumo</Text>
          <View style={styles.resumoLinha}>
            <CardResumo
              label="Salário"
              valor={formatCurrency(receitaVsDespesa.salario)}
            />
            <CardResumo
              label="Despesas do mês"
              valor={formatCurrency(receitaVsDespesa.totalDespesas)}
            />
            <CardResumo
              label="Saldo do mês"
              valor={formatCurrency(saldo)}
              negativo={saldo < 0}
            />
            <CardResumo
              label="Investido"
              valor={formatCurrency(totalInvestido)}
            />
            <CardResumo
              label="Reservas"
              valor={formatCurrency(totalReservas)}
            />
            {metaReserva && (
              <CardResumo
                label="Meta de reserva"
                valor={`${formatCurrency(metaReserva.totalReservado)} / ${formatCurrency(metaReserva.meta)}`}
              />
            )}
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Despesas do mês</Text>
          <TabelaRelatorio
            colunas={[
              {
                cabecalho: 'Descrição',
                largura: '30%',
                render: (d) => d.descricao,
              },
              {
                cabecalho: 'Categoria',
                largura: '25%',
                render: (d) => d.categoriaNome,
              },
              {
                cabecalho: 'Vencimento',
                largura: '20%',
                render: (d) =>
                  new Date(`${d.dataVencimento}T00:00:00`).toLocaleDateString(
                    'pt-BR',
                  ),
              },
              { cabecalho: 'Status', largura: '10%', render: (d) => d.status },
              {
                cabecalho: 'Valor',
                largura: '15%',
                alinhamento: 'right',
                render: (d) => formatCurrency(d.valor),
              },
            ]}
            dados={planejamento.despesas}
            chave={(d) => d.id}
            vazio="Nenhuma despesa neste mês."
          />
        </View>

        <View style={styles.secao} break>
          <Text style={styles.tituloSecao}>Parcelamentos</Text>
          <TabelaRelatorio
            colunas={colunasParcelamentos}
            dados={parcelamentos}
            chave={(p) => p.id}
            vazio="Nenhum parcelamento cadastrado."
          />
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

        <RodapeRelatorio />
      </Page>
    </Document>
  )
}

export { RelatorioGeralDocumento }
