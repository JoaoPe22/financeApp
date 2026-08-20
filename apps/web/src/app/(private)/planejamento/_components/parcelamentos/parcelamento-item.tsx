'use client'

import { ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useDeletarParcelamento,
  useDesfazerParcelasPagas,
  useMarcarParcelasPagas,
  useParcelas,
} from '@/hooks/use-parcelamentos'
import { formatDate } from '@/lib/dayjs'
import { Parcelamento } from '@/types/parcelamento'

import { ParcelamentoFormDialog } from './parcelamento-form-dialog'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface ParcelamentoItemProps {
  parcelamento: Parcelamento
}

const ParcelamentoItem = ({ parcelamento }: ParcelamentoItemProps) => {
  const [expandido, setExpandido] = useState(false)
  const [quantidade, setQuantidade] = useState('1')
  const { data: parcelas, isLoading: isLoadingParcelas } = useParcelas(
    parcelamento.id,
    expandido,
  )
  const { mutate: marcarParcelasPagas, isPending: isPagando } =
    useMarcarParcelasPagas()
  const { mutate: deletarParcelamento, isPending: isDeleting } =
    useDeletarParcelamento()
  const { mutate: desfazerParcelasPagas, isPending: isDesfazendo } =
    useDesfazerParcelasPagas()

  const quitado = parcelamento.parcelasPagas >= parcelamento.quantidadeParcelas
  const parcelasRestantes =
    parcelamento.quantidadeParcelas - parcelamento.parcelasPagas

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: parcelamento.categoriaCor }}
          />
          <div>
            <p className="font-medium">{parcelamento.descricao}</p>
            <p className="text-muted-foreground text-sm">
              {parcelamento.categoriaNome} · {parcelamento.parcelasPagas}/
              {parcelamento.quantidadeParcelas} pagas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">
            {currencyFormatter.format(parcelamento.valorTotal)}
          </span>
          <ParcelamentoFormDialog parcelamento={parcelamento} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpandido((v) => !v)}
          >
            {expandido ? <ChevronUp /> : <ChevronDown />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            onClick={() => {
              if (
                confirm(`Remover o parcelamento "${parcelamento.descricao}"?`)
              ) {
                deletarParcelamento(parcelamento.id)
              }
            }}
          >
            {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
          </Button>
        </div>
      </div>

      {!quitado && (
        <div className="mt-3 flex items-center gap-2">
          <Input
            type="number"
            min="1"
            max={parcelasRestantes}
            value={quantidade}
            onChange={(event) => setQuantidade(event.target.value)}
            className="w-20"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isPagando}
            onClick={() =>
              marcarParcelasPagas({
                id: parcelamento.id,
                quantidade: Number(quantidade),
              })}
          >
            {isPagando && <Loader2 className="animate-spin" />}
            Marcar parcela(s) como paga(s)
          </Button>
        </div>
      )}

      {parcelamento.parcelasPagas > 0 && (
        <div className="mt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isDesfazendo}
            onClick={() =>
              desfazerParcelasPagas({ id: parcelamento.id, quantidade: 1 })}
          >
            {isDesfazendo && <Loader2 className="animate-spin" />}
            Desfazer último pagamento
          </Button>
        </div>
      )}

      {expandido && (
        <div className="mt-3 space-y-1 border-t pt-3">
          {isLoadingParcelas && (
            <p className="text-muted-foreground text-sm">
              Carregando parcelas...
            </p>
          )}
          {parcelas?.map((parcelaItem) => (
            <div
              key={parcelaItem.id}
              className="flex items-center justify-between text-sm"
            >
              <span
                className={
                  parcelaItem.status === 'PAGA'
                    ? 'text-muted-foreground line-through'
                    : ''
                }
              >
                Parcela {parcelaItem.numero} · vence em{' '}
                {formatDate(parcelaItem.dataVencimento)}
              </span>
              <span>{currencyFormatter.format(parcelaItem.valor)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { ParcelamentoItem }
