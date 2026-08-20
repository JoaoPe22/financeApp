'use client'

import { Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useDeletarDespesaFixa } from '@/hooks/use-despesas-fixas'
import { DespesaFixa } from '@/types/despesa-fixa'

import { DespesaFixaFormDialog } from './despesa-fixa-form-dialog'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface DespesaFixaItemProps {
  despesaFixa: DespesaFixa
}

const DespesaFixaItem = ({ despesaFixa }: DespesaFixaItemProps) => {
  const { mutate: deletarDespesaFixa, isPending: isDeleting } =
    useDeletarDespesaFixa()

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: despesaFixa.categoriaCor }}
        />
        <div>
          <p className="font-medium">{despesaFixa.descricao}</p>
          <p className="text-muted-foreground text-sm">
            {despesaFixa.categoriaNome} · vence dia {despesaFixa.diaVencimento}
            {!despesaFixa.ativa && ' · inativa'}
            {!despesaFixa.obrigatoria && ' · opcional'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">
          {currencyFormatter.format(despesaFixa.valor)}
        </span>
        <DespesaFixaFormDialog despesaFixa={despesaFixa} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          onClick={() => {
            if (confirm(`Remover a despesa fixa "${despesaFixa.descricao}"?`)) {
              deletarDespesaFixa(despesaFixa.id)
            }
          }}
        >
          {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </div>
    </div>
  )
}

export { DespesaFixaItem }
