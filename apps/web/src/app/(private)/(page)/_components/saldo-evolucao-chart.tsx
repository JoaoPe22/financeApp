'use client'

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { PontoHistoricoSaldo } from '@/types/dashboard'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const MESES_ABREV = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

const chartConfig = {
  saldo: { label: 'Saldo', color: 'var(--chart-1)' },
} satisfies ChartConfig

interface SaldoEvolucaoChartProps {
  dados: PontoHistoricoSaldo[]
}

const SaldoEvolucaoChart = ({ dados }: SaldoEvolucaoChartProps) => {
  const chartData = dados.map((item) => ({
    mes: `${MESES_ABREV[item.mes - 1]}/${String(item.ano).slice(2)}`,
    saldo: item.saldo,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do saldo</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[220px] w-full"
        >
          <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-saldo)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-saldo)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => currencyFormatter.format(Number(value))}
                />
              }
            />
            <Area
              dataKey="saldo"
              type="monotone"
              fill="url(#fillSaldo)"
              stroke="var(--color-saldo)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export { SaldoEvolucaoChart }
