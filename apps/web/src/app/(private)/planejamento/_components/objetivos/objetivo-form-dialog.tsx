'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAtualizarObjetivo, useSalvarObjetivo } from '@/hooks/use-objetivos'
import { Objetivo, STATUS_OBJETIVO } from '@/types/objetivo'

const STATUS_LABEL: Record<string, string> = {
  [STATUS_OBJETIVO.ATIVO]: 'Ativo',
  [STATUS_OBJETIVO.CONCLUIDO]: 'Concluído',
  [STATUS_OBJETIVO.CANCELADO]: 'Cancelado',
}

const objetivoSchema = z.object({
  titulo: z.string().nonempty('Título é obrigatório'),
  descricao: z.string().nullable().optional(),
  valorMeta: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0'),
  valorAtual: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0'),
  prazo: z.iso.date({ message: 'Prazo é obrigatório' }),
  status: z.enum([
    STATUS_OBJETIVO.ATIVO,
    STATUS_OBJETIVO.CONCLUIDO,
    STATUS_OBJETIVO.CANCELADO,
  ]),
})

type ObjetivoFormData = z.infer<typeof objetivoSchema>
type ObjetivoFormInput = z.input<typeof objetivoSchema>

interface ObjetivoFormDialogProps {
  objetivo?: Objetivo
}

const ObjetivoFormDialog = ({ objetivo }: ObjetivoFormDialogProps) => {
  const [open, setOpen] = useState(false)
  const [prazo, setPrazo] = useState<Date | undefined>()
  const isEditing = !!objetivo
  const { mutateAsync: salvarObjetivo, isPending: isSaving } =
    useSalvarObjetivo()
  const { mutateAsync: atualizarObjetivo, isPending: isUpdating } =
    useAtualizarObjetivo()
  const isPending = isSaving || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ObjetivoFormInput, unknown, ObjetivoFormData>({
    resolver: zodResolver(objetivoSchema),
    defaultValues: {
      titulo: objetivo?.titulo ?? '',
      descricao: objetivo?.descricao ?? '',
      valorMeta: objetivo?.valorMeta ?? 0,
      valorAtual: objetivo?.valorAtual ?? 0,
      prazo: objetivo?.prazo ?? '',
      status: objetivo?.status ?? STATUS_OBJETIVO.ATIVO,
    },
  })

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      reset({
        titulo: objetivo?.titulo ?? '',
        descricao: objetivo?.descricao ?? '',
        valorMeta: objetivo?.valorMeta ?? 0,
        valorAtual: objetivo?.valorAtual ?? 0,
        prazo: objetivo?.prazo ?? '',
        status: objetivo?.status ?? STATUS_OBJETIVO.ATIVO,
      })
      setPrazo(objetivo?.prazo ? dayjs(objetivo.prazo).toDate() : undefined)
    }
  }

  const onSubmit = async (data: ObjetivoFormData) => {
    if (isEditing) {
      await atualizarObjetivo({ id: objetivo.id, ...data })
    } else {
      await salvarObjetivo(data)
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
              Novo objetivo
            </Button>
            )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar objetivo' : 'Novo objetivo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="titulo">Título *</FieldLabel>
                <Input id="titulo" {...register('titulo')} />
                {errors.titulo && (
                  <p className="text-destructive text-sm">
                    {errors.titulo.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
                <Input id="descricao" {...register('descricao')} />
                {errors.descricao && (
                  <p className="text-destructive text-sm">
                    {errors.descricao.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="valorMeta">Valor da meta *</FieldLabel>
                <Input
                  id="valorMeta"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('valorMeta')}
                />
                {errors.valorMeta && (
                  <p className="text-destructive text-sm">
                    {errors.valorMeta.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="valorAtual">Valor já guardado</FieldLabel>
                <Input
                  id="valorAtual"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('valorAtual')}
                />
                {errors.valorAtual && (
                  <p className="text-destructive text-sm">
                    {errors.valorAtual.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="prazo">Prazo *</FieldLabel>
                <DatePicker
                  date={prazo}
                  setDate={(date) => {
                    setPrazo(date)
                    if (date) {
                      setValue('prazo', dayjs(date).format('YYYY-MM-DD'))
                    }
                  }}
                  placeholder="Selecione o prazo"
                />
                {errors.prazo && (
                  <p className="text-destructive text-sm">
                    {errors.prazo.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel>Status *</FieldLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(STATUS_OBJETIVO).map((status) => (
                          <SelectItem key={status} value={status}>
                            {STATUS_LABEL[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-destructive text-sm">
                    {errors.status.message}
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

export { ObjetivoFormDialog }
