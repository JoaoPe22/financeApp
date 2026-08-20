'use client'

import { Bell } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lembrete, TIPO_LEMBRETE } from '@/types/dashboard'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface LembretesListProps {
  dados: Lembrete[]
}

const LembretesList = ({ dados }: LembretesListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vencendo nos próximos 7 dias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {dados.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nada vencendo nos próximos 7 dias.
          </p>
        )}

        {dados.map((item, indice) => (
          <div
            key={`${item.descricao}-${indice}`}
            className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <Bell className="text-muted-foreground size-4 shrink-0" />
              <div>
                <p className="font-medium">{item.descricao}</p>
                <p className="text-muted-foreground text-xs">
                  {item.tipo === TIPO_LEMBRETE.PARCELA ? 'Parcela' : 'Despesa'} · vence em{' '}
                  {new Date(`${item.dataVencimento}T00:00:00`).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <span className="font-medium">{currencyFormatter.format(item.valor)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export { LembretesList }
