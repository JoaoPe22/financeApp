'use client'

import { Pie, PieChart } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { GastoPorCategoria } from '@/types/dashboard'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface GastosCategoriaChartProps {
  dados: GastoPorCategoria[]
}

const GastosCategoriaChart = ({ dados }: GastosCategoriaChartProps) => {
  const chartConfig = Object.fromEntries(
    dados.map((item) => [
      item.categoriaNome,
      { label: item.categoriaNome, color: item.categoriaCor },
    ]),
  ) satisfies ChartConfig

  // <Cell> depreciado renderiza vazio no recharts instalado — a cor por
  // fatia vem do campo `fill` direto no dado.
  const chartData = dados.map((item) => ({ ...item, fill: item.categoriaCor }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por categoria</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center">
        {dados.length === 0
          ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma despesa neste mês ainda.
            </p>
            )
          : (
            <ChartContainer config={chartConfig} className="h-70 w-full">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      nameKey="categoriaNome"
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span
                            style={{
                              color: dados.find(
                                (item) => item.categoriaNome === name,
                              )?.categoriaCor,
                            }}
                          >
                            {name}
                          </span>
                          <span className="text-foreground font-mono font-medium tabular-nums">
                            {currencyFormatter.format(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                }
                />
                <Pie
                  data={chartData}
                  dataKey="valor"
                  nameKey="categoriaNome"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  isAnimationActive={false}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="categoriaNome" />}
                  verticalAlign="bottom"
                />
              </PieChart>
            </ChartContainer>
            )}
      </CardContent>
    </Card>
  )
}

export { GastosCategoriaChart }
