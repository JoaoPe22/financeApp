'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { Loader2, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useHistoricoReserva,
  useRegistrarHistoricoReserva,
} from '@/hooks/use-reservas'
import { Reserva } from '@/types/reserva'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const historicoSchema = z.object({
  valor: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0'),
  observacao: z.string().nullable().optional(),
  data: z.iso.date({ message: 'Data é obrigatória' }),
})

type HistoricoFormData = z.infer<typeof historicoSchema>
type HistoricoFormInput = z.input<typeof historicoSchema>

interface ReservaHistoricoDialogProps {
  reserva: Reserva
}

const ReservaHistoricoDialog = ({ reserva }: ReservaHistoricoDialogProps) => {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<Date | undefined>()
  const { data: historico, isLoading } = useHistoricoReserva(reserva.id, open)
  const { mutateAsync: registrarHistorico, isPending } =
    useRegistrarHistoricoReserva()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<HistoricoFormInput, unknown, HistoricoFormData>({
    resolver: zodResolver(historicoSchema),
    defaultValues: {
      valor: reserva.valor,
      observacao: '',
      data: dayjs().format('YYYY-MM-DD'),
    },
  })

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      reset({
        valor: reserva.valor,
        observacao: '',
        data: dayjs().format('YYYY-MM-DD'),
      })
      setData(new Date())
    }
  }

  const onSubmit = async (formData: HistoricoFormData) => {
    await registrarHistorico({ id: reserva.id, ...formData })
    reset({
      valor: formData.valor,
      observacao: '',
      data: dayjs().format('YYYY-MM-DD'),
    })
    setData(new Date())
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" title="Atualizar valor">
          <TrendingUp />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar valor — {reserva.instituicao}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="valor">Valor da reserva agora *</FieldLabel>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('valor')}
                />
                {errors.valor && (
                  <p className="text-destructive text-sm">
                    {errors.valor.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="data">Data da alteração *</FieldLabel>
                <DatePicker
                  date={data}
                  setDate={(date) => {
                    setData(date)
                    if (date) {
                      setValue('data', dayjs(date).format('YYYY-MM-DD'))
                    }
                  }}
                  placeholder="Selecione a data"
                />
                {errors.data && (
                  <p className="text-destructive text-sm">
                    {errors.data.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="observacao">Observação</FieldLabel>
                <Input
                  id="observacao"
                  placeholder="Ex.: resgatei R$ 500 para pagar o IPVA"
                  {...register('observacao')}
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isPending} variant="secondary">
              {isPending && <Loader2 className="animate-spin" />}
              Registrar
            </Button>
          </DialogFooter>
        </form>

        <Separator />

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {isLoading && <Skeleton className="h-12 w-full" />}

          {!isLoading && historico?.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Nenhuma atualização registrada ainda.
            </p>
          )}

          {historico?.map((item) => (
            <div key={item.id} className="rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  {currencyFormatter.format(item.valor)}
                </span>
                <span
                  className={
                    item.variacao < 0 ? 'text-destructive' : 'text-emerald-600'
                  }
                >
                  {item.variacao >= 0 ? '+' : ''}
                  {currencyFormatter.format(item.variacao)}
                </span>
              </div>
              <p className="text-muted-foreground">
                {new Date(`${item.data}T00:00:00`).toLocaleDateString('pt-BR')}
                {item.observacao ? ` · ${item.observacao}` : ''}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ReservaHistoricoDialog }
