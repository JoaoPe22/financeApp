'use client'

import { useState } from 'react'

import { MesAnoSelect } from '@/components/mes-ano-select'
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

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const hoje = new Date()

const PageContent = () => {
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const { data, isLoading } = useDashboard(mes, ano)

  if (isLoading || !data) {
    return (
      <div className="grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, indice) => (
          <Skeleton key={indice} className="h-65 w-full" />
        ))}
      </div>
    )
  }

  const totalGasto = data.receitaVsDespesa.totalDespesas

  return (
    <div className="w-full max-w-6xl space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Visão geral das suas finanças no período selecionado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Total gasto</p>
            <p className="text-xl font-semibold">
              {currencyFormatter.format(totalGasto)}
            </p>
          </div>
          <MesAnoSelect
            mes={mes}
            ano={ano}
            onChangeMes={setMes}
            onChangeAno={setAno}
          />
        </div>
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
