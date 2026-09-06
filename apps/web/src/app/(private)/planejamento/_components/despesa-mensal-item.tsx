'use client'

import { Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  useAtualizarStatusDespesaMensal,
  useDeletarDespesaMensal,
} from '@/hooks/use-planejamento-mensal'
import {
  DespesaMensal,
  STATUS_DESPESA_MENSAL,
} from '@/types/planejamento-mensal'

import { DespesaMensalDetalhesDialog } from './despesa-mensal-detalhes-dialog'
import { DespesaMensalFormDialog } from './despesa-mensal-form-dialog'
import { DespesaMensalMoverDialog } from './despesa-mensal-mover-dialog'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface DespesaMensalItemProps {
  despesaMensal: DespesaMensal
  planejamentoMensalId: string
  mes: number
  ano: number
}

const DespesaMensalItem = ({
  despesaMensal,
  planejamentoMensalId,
  mes,
  ano,
}: DespesaMensalItemProps) => {
  const { mutate: atualizarStatus } = useAtualizarStatusDespesaMensal(mes, ano)
  const { mutate: deletarDespesaMensal, isPending: isDeleting } =
    useDeletarDespesaMensal(mes, ano)
  const paga = despesaMensal.status === STATUS_DESPESA_MENSAL.PAGA

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Checkbox
          checked={paga}
          onCheckedChange={(checked) =>
            atualizarStatus({
              id: despesaMensal.id,
              status: checked
                ? STATUS_DESPESA_MENSAL.PAGA
                : STATUS_DESPESA_MENSAL.PENDENTE,
            })}
        />
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: despesaMensal.categoriaCor }}
        />
        <div>
          <DespesaMensalDetalhesDialog despesaMensal={despesaMensal}>
            <button
              type="button"
              className={`font-medium hover:underline ${paga ? 'text-muted-foreground line-through' : ''}`}
            >
              {despesaMensal.descricao}
            </button>
          </DespesaMensalDetalhesDialog>
          <p className="text-muted-foreground text-sm">
            {despesaMensal.categoriaNome} · vence em{' '}
            {new Date(
              `${despesaMensal.dataVencimento}T00:00:00`,
            ).toLocaleDateString('pt-BR')}
            {despesaMensal.despesaFixaId === null && ' · avulsa'}
            {despesaMensal.contaBancariaNome
              ? ` · ${despesaMensal.contaBancariaNome}`
              : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">
          {currencyFormatter.format(despesaMensal.valor)}
        </span>
        <DespesaMensalFormDialog
          planejamentoMensalId={planejamentoMensalId}
          mes={mes}
          ano={ano}
          despesaMensal={despesaMensal}
        />
        <DespesaMensalMoverDialog despesaMensal={despesaMensal} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          onClick={() => {
            if (
              confirm(
                `Remover a despesa "${despesaMensal.descricao}" deste mês?`,
              )
            ) {
              deletarDespesaMensal(despesaMensal.id)
            }
          }}
        >
          {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </div>
    </div>
  )
}

export { DespesaMensalItem }
