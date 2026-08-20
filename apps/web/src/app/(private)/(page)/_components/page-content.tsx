'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/hooks/use-dashboard'

import { AvisosSection } from './avisos-section'
import { DespesasPesadasList } from './despesas-pesadas-list'
import { GastosCategoriaChart } from './gastos-categoria-chart'
import { LembretesList } from './lembretes-list'
import { MetaReservaGauge } from './meta-reserva-gauge'
import { ParcelamentosChart } from './parcelamentos-chart'
import { ReceitaDespesaChart } from './receita-despesa-chart'
import { SaldoEvolucaoChart } from './saldo-evolucao-chart'

const PageContent = () => {
  const { data, isLoading } = useDashboard()

  if (isLoading || !data) {
    return (
      <div className="grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, indice) => (
          <Skeleton key={indice} className="h-65 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Visão geral das suas finanças neste mês.
        </p>
      </div>

      <AvisosSection avisos={data.avisos} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SaldoEvolucaoChart dados={data.historicoSaldo} />
        <GastosCategoriaChart dados={data.gastosPorCategoria} />
        <MetaReservaGauge meta={data.metaReserva} />
        <ParcelamentosChart dados={data.parcelamentos} />
        <ReceitaDespesaChart dados={data.receitaVsDespesa} />
        <DespesasPesadasList dados={data.despesasPesadas} />
      </div>

      <LembretesList dados={data.lembretes} />
    </div>
  )
}

export { PageContent }
