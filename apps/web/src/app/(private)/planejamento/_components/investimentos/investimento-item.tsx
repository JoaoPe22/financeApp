'use client'

import { Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useDeletarInvestimento } from '@/hooks/use-investimentos'
import { Investimento } from '@/types/investimento'

import { InvestimentoFormDialog } from './investimento-form-dialog'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
})

interface InvestimentoItemProps {
  investimento: Investimento
}

const InvestimentoItem = ({ investimento }: InvestimentoItemProps) => {
  const { mutate: deletarInvestimento, isPending: isDeleting } =
    useDeletarInvestimento()

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: investimento.categoriaCor }}
        />
        <div>
          <p className="font-medium">{investimento.descricao}</p>
          <p className="text-muted-foreground text-sm">
            {investimento.categoriaNome} · {investimento.instituicaoFinanceira}{' '}
            · {percentFormatter.format(investimento.rentabilidade)}%{' '}
            {investimento.indexador} · {investimento.liquidez} · vence em{' '}
            {new Date(
              `${investimento.dataVencimento}T00:00:00`,
            ).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">
          {currencyFormatter.format(investimento.valorAplicado)}
        </span>
        <InvestimentoFormDialog investimento={investimento} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          onClick={() => {
            if (
              confirm(`Remover o investimento "${investimento.descricao}"?`)
            ) {
              deletarInvestimento(investimento.id)
            }
          }}
        >
          {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </div>
    </div>
  )
}

export { InvestimentoItem }
