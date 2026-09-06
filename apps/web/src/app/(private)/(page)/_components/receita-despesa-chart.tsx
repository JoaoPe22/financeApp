'use client'

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const chartConfig = {
  valor: { label: 'Valor', color: 'var(--chart-1)' },
} satisfies ChartConfig

interface ReceitaDespesaChartProps {
  dados: { totalReceitas: number; totalDespesas: number; salario: number }
}

const ReceitaDespesaChart = ({ dados }: ReceitaDespesaChartProps) => {
  const chartData = [
    {
      categoria: 'Entradas',
      valor: dados.salario + dados.totalReceitas,
      fill: 'var(--chart-2)',
    },
    {
      categoria: 'Saídas',
      valor: dados.totalDespesas,
      fill: 'var(--chart-5)',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita vs. despesa do mês</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center">
        <ChartContainer config={chartConfig} className="h-55 w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="categoria"
              type="category"
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => currencyFormatter.format(Number(value))}
                />
              }
            />
            <Bar dataKey="valor" radius={4} isAnimationActive={false}>
              {chartData.map((item) => (
                <Cell key={item.categoria} fill={item.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export { ReceitaDespesaChart }
