'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMarcarParcelasPagas } from '@/hooks/use-parcelamentos'
import { ParcelaMensal, STATUS_DESPESA_MENSAL } from '@/types/planejamento-mensal'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const STATUS_LABEL: Record<string, string> = {
  [STATUS_DESPESA_MENSAL.PENDENTE]: 'Pendente',
  [STATUS_DESPESA_MENSAL.PAGA]: 'Paga',
  [STATUS_DESPESA_MENSAL.ATRASADA]: 'Atrasada',
}

interface ParcelaMensalItemProps {
  parcela: ParcelaMensal
}

// Usa a mesma mutation da página de Parcelamentos (marca as N parcelas
// pendentes mais antigas do parcelamento como pagas) — qualquer alteração
// feita aqui ou lá reflete nos dois lugares, já que invalidam as mesmas queries.
const ParcelaMensalItem = ({ parcela }: ParcelaMensalItemProps) => {
  const [quantidade, setQuantidade] = useState('1')
  const { mutate: marcarParcelasPagas, isPending } = useMarcarParcelasPagas()
  const paga = parcela.status === STATUS_DESPESA_MENSAL.PAGA

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: parcela.categoriaCor }}
        />
        <div>
          <p
            className={`font-medium ${paga ? 'text-muted-foreground line-through' : ''}`}
          >
            {parcela.descricao} ({parcela.numero}/{parcela.quantidadeParcelas})
          </p>
          <p className="text-muted-foreground text-sm">
            {parcela.categoriaNome} · vence em{' '}
            {new Date(`${parcela.dataVencimento}T00:00:00`).toLocaleDateString(
              'pt-BR',
            )}{' '}
            · {STATUS_LABEL[parcela.status] ?? parcela.status}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">
          {currencyFormatter.format(parcela.valor)}
        </span>

        {!paga && (
          <>
            <Input
              type="number"
              min="1"
              value={quantidade}
              onChange={(event) => setQuantidade(event.target.value)}
              className="w-16"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isPending}
              onClick={() =>
                marcarParcelasPagas({
                  id: parcela.parcelamentoId,
                  quantidade: Number(quantidade),
                })}
            >
              {isPending && <Loader2 className="animate-spin" />}
              Marcar como paga(s)
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export { ParcelaMensalItem }
