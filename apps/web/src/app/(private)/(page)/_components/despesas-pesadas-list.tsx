'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DespesaPesada } from '@/types/dashboard'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface DespesasPesadasListProps {
  dados: DespesaPesada[]
}

const DespesasPesadasList = ({ dados }: DespesasPesadasListProps) => {
  const maiorValor = Math.max(...dados.map((item) => item.valor), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas mais pesadas do mês</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {dados.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhuma despesa neste mês ainda.
          </p>
        )}

        {dados.map((item) => (
          <div key={item.descricao} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.descricao}</span>
              <span className="text-muted-foreground">
                {currencyFormatter.format(item.valor)}
              </span>
            </div>
            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-chart-5 h-full rounded-full"
                style={{ width: `${(item.valor / maiorValor) * 100}%` }}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              {item.categoriaNome}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export { DespesasPesadasList }
