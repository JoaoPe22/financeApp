'use client'

import { Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useDeletarReserva } from '@/hooks/use-reservas'
import { Reserva } from '@/types/reserva'

import { ReservaFormDialog } from './reserva-form-dialog'
import { ReservaHistoricoDialog } from './reserva-historico-dialog'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
})

interface ReservaItemProps {
  reserva: Reserva
}

const ReservaItem = ({ reserva }: ReservaItemProps) => {
  const { mutate: deletarReserva, isPending: isDeleting } = useDeletarReserva()

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div>
        <p className="font-medium">{reserva.instituicao}</p>
        <p className="text-muted-foreground text-sm">
          {percentFormatter.format(reserva.rentabilidade)}% do CDI
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">
          {currencyFormatter.format(reserva.valor)}
        </span>
        <ReservaHistoricoDialog reserva={reserva} />
        <ReservaFormDialog reserva={reserva} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          onClick={() => {
            if (confirm(`Remover a reserva em "${reserva.instituicao}"?`)) {
              deletarReserva(reserva.id)
            }
          }}
        >
          {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </div>
    </div>
  )
}

export { ReservaItem }
