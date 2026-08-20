'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
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
import { useAtualizarReserva, useSalvarReserva } from '@/hooks/use-reservas'
import { Reserva } from '@/types/reserva'

const reservaSchema = z.object({
  instituicao: z.string().nonempty('Instituição é obrigatória'),
  valor: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0'),
  rentabilidade: z.coerce
    .number()
    .min(0, 'Rentabilidade deve ser maior ou igual a 0'),
})

type ReservaFormData = z.infer<typeof reservaSchema>

interface ReservaFormDialogProps {
  reserva?: Reserva
}

const ReservaFormDialog = ({ reserva }: ReservaFormDialogProps) => {
  const [open, setOpen] = useState(false)
  const isEditing = !!reserva
  const { mutateAsync: salvarReserva, isPending: isSaving } =
    useSalvarReserva()
  const { mutateAsync: atualizarReserva, isPending: isUpdating } =
    useAtualizarReserva()
  const isPending = isSaving || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      instituicao: reserva?.instituicao ?? '',
      valor: reserva?.valor ?? 0,
      rentabilidade: reserva?.rentabilidade ?? 0,
    },
  })

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      reset({
        instituicao: reserva?.instituicao ?? '',
        valor: reserva?.valor ?? 0,
        rentabilidade: reserva?.rentabilidade ?? 0,
      })
    }
  }

  const onSubmit = async (data: ReservaFormData) => {
    if (isEditing) {
      await atualizarReserva({ id: reserva.id, ...data })
    } else {
      await salvarReserva(data)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEditing
          ? (
            <Button type="button" variant="ghost" size="sm">
              Editar
            </Button>
            )
          : (
            <Button type="button" variant="secondary">
              <Plus />
              Nova reserva
            </Button>
            )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar reserva' : 'Nova reserva'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="instituicao">Instituição *</FieldLabel>
                <Input id="instituicao" {...register('instituicao')} />
                {errors.instituicao && (
                  <p className="text-destructive text-sm">
                    {errors.instituicao.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="valor">Valor guardado *</FieldLabel>
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
                <FieldLabel htmlFor="rentabilidade">
                  Rentabilidade (% do CDI) *
                </FieldLabel>
                <Input
                  id="rentabilidade"
                  type="number"
                  step="0.0001"
                  min="0"
                  {...register('rentabilidade')}
                />
                {errors.rentabilidade && (
                  <p className="text-destructive text-sm">
                    {errors.rentabilidade.message}
                  </p>
                )}
              </Field>
            </FieldGroup>
          </FieldSet>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isPending} variant="secondary">
              {isPending && <Loader2 className="animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { ReservaFormDialog }
