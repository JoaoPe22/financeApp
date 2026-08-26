'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import { authClient } from '@/auth/client'
import { MesAnoSelect, MESES } from '@/components/mes-ano-select'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/hooks/use-dashboard'
import { useInvestimentos } from '@/hooks/use-investimentos'
import { useObjetivos } from '@/hooks/use-objetivos'
import { useParcelamentos } from '@/hooks/use-parcelamentos'
import { usePlanejamentoMensal } from '@/hooks/use-planejamento-mensal'
import { useReservas } from '@/hooks/use-reservas'
import { type ColunaCsv } from '@/lib/csv'
import { formatDate } from '@/lib/dayjs'
import { Investimento } from '@/types/investimento'
import { Parcelamento } from '@/types/parcelamento'
import { DespesaMensal, Receita } from '@/types/planejamento-mensal'

import { DownloadCsvButton } from './download-csv-button'
import { InvestimentosDocumento } from './pdf/investimentos-documento'
import { ParcelamentosDocumento } from './pdf/parcelamentos-documento'
import { PlanejamentoMensalDocumento } from './pdf/planejamento-mensal-documento'
import { RelatorioGeralDocumento } from './pdf/relatorio-geral-documento'

const DownloadRelatorioButton = dynamic(
  () =>
    import('./download-relatorio-button').then(
      (mod) => mod.DownloadRelatorioButton,
    ),
  { ssr: false, loading: () => <Skeleton className="h-9 w-32" /> },
)

const hoje = new Date()

const COLUNAS_DESPESAS: ColunaCsv<DespesaMensal>[] = [
  { cabecalho: 'Descrição', valor: (item) => item.descricao },
  { cabecalho: 'Categoria', valor: (item) => item.categoriaNome },
  { cabecalho: 'Vencimento', valor: (item) => formatDate(item.dataVencimento) },
  { cabecalho: 'Valor', valor: (item) => item.valor },
  { cabecalho: 'Status', valor: (item) => item.status },
]

const COLUNAS_RECEITAS: ColunaCsv<Receita>[] = [
  { cabecalho: 'Descrição', valor: (item) => item.descricao },
  { cabecalho: 'Categoria', valor: (item) => item.categoriaNome },
  {
    cabecalho: 'Recebimento',
    valor: (item) => formatDate(item.dataRecebimento),
  },
  { cabecalho: 'Valor líquido', valor: (item) => item.valorLiquido },
]

const COLUNAS_PARCELAMENTOS: ColunaCsv<Parcelamento>[] = [
  { cabecalho: 'Descrição', valor: (item) => item.descricao },
  { cabecalho: 'Categoria', valor: (item) => item.categoriaNome },
  { cabecalho: 'Valor total', valor: (item) => item.valorTotal },
  { cabecalho: 'Entrada', valor: (item) => item.valorEntrada ?? 0 },
  { cabecalho: 'Parcelas', valor: (item) => item.quantidadeParcelas },
  { cabecalho: 'Parcelas pagas', valor: (item) => item.parcelasPagas },
  {
    cabecalho: 'Primeira parcela',
    valor: (item) => formatDate(item.dataPrimeiraParcela),
  },
]

const COLUNAS_INVESTIMENTOS: ColunaCsv<Investimento>[] = [
  { cabecalho: 'Descrição', valor: (item) => item.descricao },
  { cabecalho: 'Instituição', valor: (item) => item.instituicaoFinanceira },
  { cabecalho: 'Valor aplicado', valor: (item) => item.valorAplicado },
  { cabecalho: 'Rentabilidade', valor: (item) => item.rentabilidade },
  { cabecalho: 'Indexador', valor: (item) => item.indexador },
  { cabecalho: 'Liquidez', valor: (item) => item.liquidez },
  { cabecalho: 'Aplicação', valor: (item) => formatDate(item.dataAplicacao) },
]

const PageContent = () => {
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())

  const { data: session } = authClient.useSession()
  const nomeUsuario = session?.user?.name

  const { data: planejamento, isLoading: isLoadingPlanejamento } =
    usePlanejamentoMensal(mes, ano)
  const { data: parcelamentos, isLoading: isLoadingParcelamentos } =
    useParcelamentos()
  const { data: investimentos, isLoading: isLoadingInvestimentos } =
    useInvestimentos()
  const { data: objetivos, isLoading: isLoadingObjetivos } = useObjetivos()
  const { data: reservas, isLoading: isLoadingReservas } = useReservas()
  const { data: dashboard, isLoading: isLoadingDashboard } = useDashboard(
    mes,
    ano,
  )

  const investimentosProntos =
    !isLoadingInvestimentos &&
    !isLoadingObjetivos &&
    !isLoadingReservas &&
    investimentos &&
    objetivos &&
    reservas

  const geralPronto =
    !isLoadingDashboard &&
    !isLoadingPlanejamento &&
    !isLoadingParcelamentos &&
    investimentosProntos &&
    dashboard &&
    planejamento &&
    parcelamentos

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-2xl font-semibold">Relatórios</h1>
        <p className="text-muted-foreground text-sm">
          Gere relatórios em PDF com os dados financeiros cadastrados.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Planejamento mensal</CardTitle>
            <CardDescription>
              Receitas, despesas e parcelas do mês selecionado.
            </CardDescription>
          </div>
          <MesAnoSelect
            mes={mes}
            ano={ano}
            onChangeMes={setMes}
            onChangeAno={setAno}
          />
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2">
          {isLoadingPlanejamento || !planejamento
            ? (
              <Skeleton className="h-9 w-32" />
              )
            : (
              <>
                <DownloadRelatorioButton
                  document={
                    <PlanejamentoMensalDocumento
                      dados={planejamento}
                      mes={mes}
                      ano={ano}
                      nomeUsuario={nomeUsuario}
                    />
                }
                  fileName={`planejamento-mensal-${MESES[mes - 1].toLowerCase()}-${ano}.pdf`}
                />
                <DownloadCsvButton
                  colunas={COLUNAS_DESPESAS}
                  linhas={planejamento.despesas}
                  fileName={`despesas-${MESES[mes - 1].toLowerCase()}-${ano}.csv`}
                />
                <DownloadCsvButton
                  colunas={COLUNAS_RECEITAS}
                  linhas={planejamento.receitas}
                  fileName={`receitas-${MESES[mes - 1].toLowerCase()}-${ano}.csv`}
                />
              </>
              )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parcelamentos</CardTitle>
          <CardDescription>
            Todos os parcelamentos cadastrados e seu progresso.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2">
          {isLoadingParcelamentos || !parcelamentos
            ? (
              <Skeleton className="h-9 w-32" />
              )
            : (
              <>
                <DownloadRelatorioButton
                  document={
                    <ParcelamentosDocumento
                      parcelamentos={parcelamentos}
                      nomeUsuario={nomeUsuario}
                    />
                }
                  fileName="parcelamentos.pdf"
                />
                <DownloadCsvButton
                  colunas={COLUNAS_PARCELAMENTOS}
                  linhas={parcelamentos}
                  fileName="parcelamentos.csv"
                />
              </>
              )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investimentos e objetivos</CardTitle>
          <CardDescription>
            Investimentos, objetivos e reservas cadastrados.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2">
          {!investimentosProntos
            ? (
              <Skeleton className="h-9 w-32" />
              )
            : (
              <>
                <DownloadRelatorioButton
                  document={
                    <InvestimentosDocumento
                      investimentos={investimentos}
                      objetivos={objetivos}
                      reservas={reservas}
                      nomeUsuario={nomeUsuario}
                    />
                }
                  fileName="investimentos-e-objetivos.pdf"
                />
                <DownloadCsvButton
                  colunas={COLUNAS_INVESTIMENTOS}
                  linhas={investimentos}
                  fileName="investimentos.csv"
                />
              </>
              )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relatório geral</CardTitle>
          <CardDescription>
            Resumo consolidado do mês selecionado, parcelamentos, investimentos
            e objetivos.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          {!geralPronto
            ? (
              <Skeleton className="h-9 w-32" />
              )
            : (
              <DownloadRelatorioButton
                document={
                  <RelatorioGeralDocumento
                    mes={mes}
                    ano={ano}
                    dashboard={dashboard}
                    planejamento={planejamento}
                    parcelamentos={parcelamentos}
                    investimentos={investimentos}
                    objetivos={objetivos}
                    reservas={reservas}
                    nomeUsuario={nomeUsuario}
                  />
              }
                fileName={`relatorio-geral-${MESES[mes - 1].toLowerCase()}-${ano}.pdf`}
              />
              )}
        </CardFooter>
      </Card>
    </div>
  )
}

export { PageContent }
