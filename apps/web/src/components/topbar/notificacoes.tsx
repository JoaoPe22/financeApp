'use client'

import { Bell } from 'lucide-react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useDashboard } from '@/hooks/use-dashboard'
import { dayjs, formatDate } from '@/lib/dayjs'
import { Lembrete, TIPO_LEMBRETE } from '@/types/dashboard'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

// Reaproveita o `lembretes` que a rota /dashboard já calcula — mesmo queryKey
// do useDashboard, então abrir o sino não dispara requisição nenhuma.
const estaVencido = (lembrete: Lembrete) =>
  dayjs(lembrete.dataVencimento).isBefore(dayjs().startOf('day'))

const Notificacoes = () => {
  const { data: dashboard, isLoading } = useDashboard()

  const lembretes = dashboard?.lembretes ?? []
  const vencidos = lembretes.filter(estaVencido)

  return (
    <Popover>
      <PopoverTrigger
        className="hover:bg-accent relative rounded-md p-2 outline-none"
        aria-label={
          lembretes.length > 0
            ? `Notificações: ${lembretes.length} vencimento(s)`
            : 'Notificações'
        }
      >
        <Bell className="size-5" />
        {lembretes.length > 0 && (
          <span
            className={`absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium text-white ${
              vencidos.length > 0 ? 'bg-destructive' : 'bg-primary'
            }`}
          >
            {lembretes.length > 9 ? '9+' : lembretes.length}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium">Vencimentos</p>
          <p className="text-muted-foreground text-xs">
            Contas vencidas e a vencer nos próximos 7 dias.
          </p>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading && (
            <p className="text-muted-foreground px-4 py-6 text-center text-sm">
              Carregando...
            </p>
          )}

          {!isLoading && lembretes.length === 0 && (
            <p className="text-muted-foreground px-4 py-6 text-center text-sm">
              Nada vencendo por aqui. 🎉
            </p>
          )}

          {lembretes.map((lembrete) => {
            const vencido = estaVencido(lembrete)

            return (
              <div
                key={`${lembrete.tipo}-${lembrete.descricao}-${lembrete.dataVencimento}`}
                className="flex items-start justify-between gap-3 border-b px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {lembrete.descricao}
                  </p>
                  <p
                    className={`text-xs ${vencido ? 'text-destructive font-medium' : 'text-muted-foreground'}`}
                  >
                    {vencido ? 'Venceu em ' : 'Vence em '}
                    {formatDate(lembrete.dataVencimento)}
                    {lembrete.tipo === TIPO_LEMBRETE.PARCELA && ' · parcela'}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium">
                  {currencyFormatter.format(lembrete.valor)}
                </span>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { Notificacoes }
