'use client'

import { Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useDeletarReceita } from '@/hooks/use-planejamento-mensal'
import { Receita } from '@/types/planejamento-mensal'

import { ReceitaFormDialog } from './receita-form-dialog'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface ReceitaItemProps {
  receita: Receita
  planejamentoMensalId: string
  mes: number
  ano: number
}

const ReceitaItem = ({
  receita,
  planejamentoMensalId,
  mes,
  ano,
}: ReceitaItemProps) => {
  const { mutate: deletarReceita, isPending: isDeleting } = useDeletarReceita(
    mes,
    ano,
  )

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: receita.categoriaCor }}
        />
        <div>
          <p className="font-medium">{receita.descricao}</p>
          <p className="text-muted-foreground text-sm">
            {receita.categoriaNome} · recebida em{' '}
            {new Date(`${receita.dataRecebimento}T00:00:00`).toLocaleDateString(
              'pt-BR',
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">
          {currencyFormatter.format(receita.valorLiquido)}
        </span>
        <ReceitaFormDialog
          planejamentoMensalId={planejamentoMensalId}
          mes={mes}
          ano={ano}
          receita={receita}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          onClick={() => {
            if (confirm(`Remover a receita "${receita.descricao}"?`)) {
              deletarReceita(receita.id)
            }
          }}
        >
          {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </div>
    </div>
  )
}

export { ReceitaItem }
