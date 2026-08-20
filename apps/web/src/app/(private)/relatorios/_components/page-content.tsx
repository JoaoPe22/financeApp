'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import { authClient } from '@/auth/client'
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

import { MesAnoSelect, MESES } from './mes-ano-select'
import { InvestimentosDocumento } from './pdf/investimentos-documento'
import { ParcelamentosDocumento } from './pdf/parcelamentos-documento'
import { PlanejamentoMensalDocumento } from './pdf/planejamento-mensal-documento'
import { RelatorioGeralDocumento } from './pdf/relatorio-geral-documento'

const DownloadRelatorioButton = dynamic(
  () => import('./download-relatorio-button').then((mod) => mod.DownloadRelatorioButton),
  { ssr: false, loading: () => <Skeleton className="h-9 w-32" /> },
)

const hoje = new Date()

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
  const { data: dashboard, isLoading: isLoadingDashboard } = useDashboard()

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
        <CardFooter>
          {isLoadingPlanejamento || !planejamento
            ? (
              <Skeleton className="h-9 w-32" />
              )
            : (
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
        <CardFooter>
          {isLoadingParcelamentos || !parcelamentos
            ? (
              <Skeleton className="h-9 w-32" />
              )
            : (
              <DownloadRelatorioButton
                document={
                  <ParcelamentosDocumento
                    parcelamentos={parcelamentos}
                    nomeUsuario={nomeUsuario}
                  />
              }
                fileName="parcelamentos.pdf"
              />
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
        <CardFooter>
          {!investimentosProntos
            ? (
              <Skeleton className="h-9 w-32" />
              )
            : (
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
