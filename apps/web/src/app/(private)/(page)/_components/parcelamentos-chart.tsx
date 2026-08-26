'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { ParcelamentoResumo } from '@/types/dashboard'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const chartConfig = {
  totalPago: { label: 'Pago', color: 'var(--chart-2)' },
  totalPendente: { label: 'Pendente', color: 'var(--chart-5)' },
} satisfies ChartConfig

interface ParcelamentosChartProps {
  dados: ParcelamentoResumo[]
}

const ParcelamentosChart = ({ dados }: ParcelamentosChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parcelamentos</CardTitle>
      </CardHeader>
      <CardContent>
        {dados.length === 0
          ? (
            <p className="text-muted-foreground text-sm">
              Nenhum parcelamento cadastrado.
            </p>
            )
          : (
            <ChartContainer config={chartConfig} className="h-55 w-full">
              <BarChart data={dados} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="descricao"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        currencyFormatter.format(Number(value))}
                    />
                }
                />
                <Bar
                  dataKey="totalPago"
                  stackId="a"
                  fill="var(--color-totalPago)"
                  radius={[4, 0, 0, 4]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="totalPendente"
                  stackId="a"
                  fill="var(--color-totalPendente)"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartContainer>
            )}
      </CardContent>
    </Card>
  )
}

export { ParcelamentosChart }
