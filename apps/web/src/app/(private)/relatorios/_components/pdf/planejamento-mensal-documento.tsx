import { Document, Page, Text, View } from '@react-pdf/renderer'

import { MESES } from '@/components/mes-ano-select'
import {
  DespesaMensal,
  ParcelaMensal,
  PlanejamentoMensalResponse,
  Receita,
} from '@/types/planejamento-mensal'

import { CabecalhoRelatorio, RodapeRelatorio } from './cabecalho'
import { CardResumo } from './card-resumo'
import { formatCurrency } from './format'
import { styles } from './styles'
import { ColunaTabela, TabelaRelatorio } from './tabela'

interface PlanejamentoMensalDocumentoProps {
  dados: PlanejamentoMensalResponse
  mes: number
  ano: number
  nomeUsuario?: string | null
}

const colunasReceitas: ColunaTabela<Receita>[] = [
  { cabecalho: 'Descrição', largura: '35%', render: (r) => r.descricao },
  { cabecalho: 'Categoria', largura: '25%', render: (r) => r.categoriaNome },
  {
    cabecalho: 'Recebimento',
    largura: '18%',
    render: (r) => new Date(`${r.dataRecebimento}T00:00:00`).toLocaleDateString('pt-BR'),
  },
  {
    cabecalho: 'Valor',
    largura: '22%',
    alinhamento: 'right',
    render: (r) => formatCurrency(r.valorLiquido),
  },
]

const colunasDespesas: ColunaTabela<DespesaMensal>[] = [
  { cabecalho: 'Descrição', largura: '32%', render: (d) => d.descricao },
  { cabecalho: 'Categoria', largura: '22%', render: (d) => d.categoriaNome },
  {
    cabecalho: 'Vencimento',
    largura: '16%',
    render: (d) => new Date(`${d.dataVencimento}T00:00:00`).toLocaleDateString('pt-BR'),
  },
  { cabecalho: 'Status', largura: '12%', render: (d) => d.status },
  {
    cabecalho: 'Valor',
    largura: '18%',
    alinhamento: 'right',
    render: (d) => formatCurrency(d.valor),
  },
]

const colunasParcelas: ColunaTabela<ParcelaMensal>[] = [
  { cabecalho: 'Descrição', largura: '30%', render: (p) => p.descricao },
  { cabecalho: 'Categoria', largura: '20%', render: (p) => p.categoriaNome },
  {
    cabecalho: 'Parcela',
    largura: '12%',
    alinhamento: 'center',
    render: (p) => `${p.numero}/${p.quantidadeParcelas}`,
  },
  {
    cabecalho: 'Vencimento',
    largura: '14%',
    render: (p) => new Date(`${p.dataVencimento}T00:00:00`).toLocaleDateString('pt-BR'),
  },
  { cabecalho: 'Status', largura: '10%', render: (p) => p.status },
  {
    cabecalho: 'Valor',
    largura: '14%',
    alinhamento: 'right',
    render: (p) => formatCurrency(p.valor),
  },
]

const PlanejamentoMensalDocumento = ({
  dados,
  mes,
  ano,
  nomeUsuario,
}: PlanejamentoMensalDocumentoProps) => {
  const { planejamento, despesas, receitas, parcelas } = dados

  const totalReceitas = receitas.reduce((soma, r) => soma + r.valorLiquido, 0)
  const totalDespesas = despesas.reduce((soma, d) => soma + d.valor, 0)
  const totalParcelas = parcelas.reduce((soma, p) => soma + p.valor, 0)
  const salario = planejamento?.salarioRecebido ?? planejamento?.salarioPrevisto ?? 0
  const saldo = salario + totalReceitas - totalDespesas - totalParcelas

  return (
    <Document
      title={`Planejamento Mensal - ${MESES[mes - 1]} ${ano}`}
      author="Relatórios"
    >
      <Page size="A4" style={styles.pagina}>
        <CabecalhoRelatorio
          titulo="Relatório de Planejamento Mensal"
          subtitulo={`${MESES[mes - 1]} de ${ano}`}
          nomeUsuario={nomeUsuario}
        />

        <View style={styles.resumoLinha}>
          <CardResumo label="Salário" valor={formatCurrency(salario)} />
          <CardResumo label="Outras receitas" valor={formatCurrency(totalReceitas)} />
          <CardResumo label="Despesas" valor={formatCurrency(totalDespesas)} />
          <CardResumo label="Parcelas" valor={formatCurrency(totalParcelas)} />
          <CardResumo
            label="Saldo do mês"
            valor={formatCurrency(saldo)}
            negativo={saldo < 0}
          />
        </View>

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Receitas</Text>
          <TabelaRelatorio
            colunas={colunasReceitas}
            dados={receitas}
            chave={(r) => r.id}
            vazio="Nenhuma receita além do salário neste mês."
          />
        </View>

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Despesas</Text>
          <TabelaRelatorio
            colunas={colunasDespesas}
            dados={despesas}
            chave={(d) => d.id}
            vazio="Nenhuma despesa neste mês."
          />
        </View>

        {parcelas.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.tituloSecao}>Parcelamentos do mês</Text>
            <TabelaRelatorio
              colunas={colunasParcelas}
              dados={parcelas}
              chave={(p) => p.id}
            />
          </View>
        )}

        <RodapeRelatorio />
      </Page>
    </Document>
  )
}

export { PlanejamentoMensalDocumento }
