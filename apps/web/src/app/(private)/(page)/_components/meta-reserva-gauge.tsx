'use client'

import {
  Label,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

const chartConfig = {
  reservado: { label: 'Reservado', color: 'var(--chart-1)' },
} satisfies ChartConfig

interface MetaReservaGaugeProps {
  meta: { totalReservado: number; meta: number } | null
}

const MetaReservaGauge = ({ meta }: MetaReservaGaugeProps) => {
  if (!meta) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reserva de emergência</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Sem dados suficientes para calcular uma meta ainda.
          </p>
        </CardContent>
      </Card>
    )
  }

  const percentual = Math.min(
    100,
    Math.round((meta.totalReservado / meta.meta) * 100),
  )
  const reservado = Math.min(meta.totalReservado, meta.meta)
  const chartData = [{ reservado, fill: 'var(--color-reservado)' }]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reserva de emergência</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-55"
        >
          <RadialBarChart
            data={chartData}
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, meta.meta]}
              tick={false}
              axisLine={false}
            />
            <RadialBar
              dataKey="reservado"
              background
              cornerRadius={10}
              isAnimationActive={false}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) - 8}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {percentual}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 14}
                          className="fill-muted-foreground text-xs"
                        >
                          {currencyFormatter.format(meta.totalReservado)} de{' '}
                          {currencyFormatter.format(meta.meta)}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export { MetaReservaGauge }
