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
import { useCategorias } from '@/hooks/use-categorias'
import {
  useAtualizarDespesaMensal,
  useSalvarDespesaMensal,
} from '@/hooks/use-planejamento-mensal'
import { DespesaMensal } from '@/types/planejamento-mensal'

const despesaMensalSchema = z.object({
  categoriaId: z.string().nonempty('Categoria é obrigatória'),
  descricao: z.string().nonempty('Descrição é obrigatória'),
  valor: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0'),
  dataVencimento: z.iso.date({ message: 'Data de vencimento é obrigatória' }),
  observacao: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
})

type DespesaMensalFormData = z.infer<typeof despesaMensalSchema>

interface DespesaMensalFormDialogProps {
  planejamentoMensalId: string
  mes: number
  ano: number
  despesaMensal?: DespesaMensal
}

const DespesaMensalFormDialog = ({
  planejamentoMensalId,
  mes,
  ano,
  despesaMensal,
}: DespesaMensalFormDialogProps) => {
  const [open, setOpen] = useState(false)
  const [dataVencimento, setdataVencimento] = useState<Date | undefined>()
  const isEditing = !!despesaMensal
  const { data: categorias } = useCategorias('DESPESA')
  const { mutateAsync: salvarDespesaMensal, isPending: isSaving } =
    useSalvarDespesaMensal(mes, ano)
  const { mutateAsync: atualizarDespesaMensal, isPending: isUpdating } =
    useAtualizarDespesaMensal(mes, ano)
  const isPending = isSaving || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<DespesaMensalFormData>({
    resolver: zodResolver(despesaMensalSchema),
    defaultValues: {
      categoriaId: despesaMensal?.categoriaId ?? '',
      descricao: despesaMensal?.descricao ?? '',
      valor: despesaMensal?.valor ?? 0,
      dataVencimento: despesaMensal?.dataVencimento ?? '',
      observacao: despesaMensal?.observacao ?? '',
    },
  })

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      reset({
        categoriaId: despesaMensal?.categoriaId ?? '',
        descricao: despesaMensal?.descricao ?? '',
        valor: despesaMensal?.valor ?? 0,
        dataVencimento: despesaMensal?.dataVencimento ?? '',
        observacao: despesaMensal?.observacao ?? '',
      })
      setdataVencimento(
        despesaMensal
          ? new Date(`${despesaMensal.dataVencimento}T00:00:00`)
          : undefined,
      )
    }
  }

  const onSubmit = async (data: DespesaMensalFormData) => {
    if (isEditing) {
      await atualizarDespesaMensal({ id: despesaMensal.id, ...data })
    } else {
      await salvarDespesaMensal({ planejamentoMensalId, ...data })
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button type="button" variant="ghost" size="sm">
            Editar
          </Button>
        ) : (
          <Button type="button" variant="secondary">
            <Plus />
            Nova despesa avulsa
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar despesa do mês' : 'Nova despesa avulsa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel>Categoria *</FieldLabel>
                <Controller
                  name="categoriaId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias?.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            <span
                              className="inline-block size-2.5 rounded-full"
                              style={{ backgroundColor: categoria.cor }}
                            />
                            {categoria.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoriaId && (
                  <p className="text-destructive text-sm">
                    {errors.categoriaId.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="descricao">Descrição *</FieldLabel>
                <Input id="descricao" {...register('descricao')} />
                {errors.descricao && (
                  <p className="text-destructive text-sm">
                    {errors.descricao.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="valor">Valor *</FieldLabel>
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
                <FieldLabel htmlFor="dataVencimento">
                  Data de vencimento *
                </FieldLabel>
                <DatePicker
                  date={dataVencimento}
                  setDate={(date) => {
                    setdataVencimento(date)
                    if (date) {
                      setValue(
                        'dataVencimento',
                        dayjs(date).format('YYYY-MM-DD'),
                      )
                    }
                  }}
                  placeholder="Selecione a data de vencimento"
                />
                {errors.dataVencimento && (
                  <p className="text-destructive text-sm">
                    {errors.dataVencimento.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="observacao">Observação</FieldLabel>
                <Input id="observacao" {...register('observacao')} />
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

export { DespesaMensalFormDialog }
