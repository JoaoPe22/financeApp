'use client'

import dayjs from 'dayjs'
import { CalendarClock, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { useMoverDespesaMensal } from '@/hooks/use-planejamento-mensal'
import { DespesaMensal } from '@/types/planejamento-mensal'

interface DespesaMensalMoverDialogProps {
  despesaMensal: DespesaMensal
}

const DespesaMensalMoverDialog = ({
  despesaMensal,
}: DespesaMensalMoverDialogProps) => {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<Date | undefined>(
    new Date(`${despesaMensal.dataVencimento}T00:00:00`),
  )
  const { mutate: moverDespesaMensal, isPending } = useMoverDespesaMensal()

  const onConfirmar = () => {
    if (!data) return

    moverDespesaMensal(
      {
        id: despesaMensal.id,
        dataVencimento: dayjs(data).format('YYYY-MM-DD'),
      },
      { onSuccess: () => setOpen(false) },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(novoOpen) => {
        setOpen(novoOpen)
        if (novoOpen) {
          setData(new Date(`${despesaMensal.dataVencimento}T00:00:00`))
        }
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        title="Mover para outra data"
        onClick={() => setOpen(true)}
      >
        <CalendarClock />
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mover despesa para outra data</DialogTitle>
        </DialogHeader>

        <Field>
          <FieldLabel>Nova data de vencimento *</FieldLabel>
          <DatePicker date={data} setDate={setData} />
        </Field>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={isPending || !data}
            onClick={onConfirmar}
          >
            {isPending && <Loader2 className="animate-spin" />}
            Mover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DespesaMensalMoverDialog }
