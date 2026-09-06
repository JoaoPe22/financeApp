'use client'

import { Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useDeletarObjetivo } from '@/hooks/use-objetivos'
import { Objetivo, STATUS_OBJETIVO } from '@/types/objetivo'

import { ObjetivoFormDialog } from './objetivo-form-dialog'
import { ObjetivoHistoricoDialog } from './objetivo-historico-dialog'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const STATUS_LABEL: Record<string, string> = {
  [STATUS_OBJETIVO.ATIVO]: 'Ativo',
  [STATUS_OBJETIVO.CONCLUIDO]: 'Concluído',
  [STATUS_OBJETIVO.CANCELADO]: 'Cancelado',
}

interface ObjetivoItemProps {
  objetivo: Objetivo
}

const ObjetivoItem = ({ objetivo }: ObjetivoItemProps) => {
  const { mutate: deletarObjetivo, isPending: isDeleting } =
    useDeletarObjetivo()

  const progresso =
    objetivo.valorMeta > 0
      ? Math.min(
        100,
        Math.round((objetivo.valorAtual / objetivo.valorMeta) * 100),
      )
      : 0

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div>
        <p className="font-medium">{objetivo.titulo}</p>
        <p className="text-muted-foreground text-sm">
          {currencyFormatter.format(objetivo.valorAtual)} de{' '}
          {currencyFormatter.format(objetivo.valorMeta)} ({progresso}%) · prazo{' '}
          {new Date(`${objetivo.prazo}T00:00:00`).toLocaleDateString('pt-BR')} ·{' '}
          {STATUS_LABEL[objetivo.status] ?? objetivo.status}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ObjetivoHistoricoDialog objetivo={objetivo} />
        <ObjetivoFormDialog objetivo={objetivo} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          onClick={() => {
            if (confirm(`Remover o objetivo "${objetivo.titulo}"?`)) {
              deletarObjetivo(objetivo.id)
            }
          }}
        >
          {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </div>
    </div>
  )
}

export { ObjetivoItem }
