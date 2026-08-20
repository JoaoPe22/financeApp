'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { CategoriaDialog } from '@/components/categoria-dialog'
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
  useAtualizarReceita,
  useSalvarReceita,
} from '@/hooks/use-planejamento-mensal'
import { parseDateOnly } from '@/lib/dayjs'
import { TIPOCATEGORIA } from '@/types/categoria'
import { Receita } from '@/types/planejamento-mensal'

const receitaSchema = z.object({
  categoriaId: z.string().nonempty('Categoria é obrigatória'),
  descricao: z.string().nonempty('Descrição é obrigatória'),
  valorBruto: z.coerce
    .number()
    .min(0, 'Valor bruto deve ser maior ou igual a 0')
    .nullable()
    .optional(),
  valorLiquido: z.coerce
    .number()
    .min(0, 'Valor líquido deve ser maior ou igual a 0'),
  dataRecebimento: z.iso.date({ message: 'Data de recebimento é obrigatória' }),
  observacao: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
})

type ReceitaFormData = z.infer<typeof receitaSchema>

interface ReceitaFormDialogProps {
  planejamentoMensalId: string
  mes: number
  ano: number
  receita?: Receita
}

const ReceitaFormDialog = ({
  planejamentoMensalId,
  mes,
  ano,
  receita,
}: ReceitaFormDialogProps) => {
  const [open, setOpen] = useState(false)
  const [dataRecebimento, setDataRecebimento] = useState<Date | undefined>(
    () =>
      receita?.dataRecebimento
        ? (parseDateOnly(receita.dataRecebimento) ?? undefined)
        : undefined,
  )
  const isEditing = !!receita
  const { data: categorias } = useCategorias('RECEITA')
  const { mutateAsync: salvarReceita, isPending: isSaving } = useSalvarReceita(
    mes,
    ano,
  )
  const { mutateAsync: atualizarReceita, isPending: isUpdating } =
    useAtualizarReceita(mes, ano)
  const isPending = isSaving || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ReceitaFormData>({
    resolver: zodResolver(receitaSchema),
    defaultValues: {
      categoriaId: receita?.categoriaId ?? '',
      descricao: receita?.descricao ?? '',
      valorBruto: receita?.valorBruto ?? null,
      valorLiquido: receita?.valorLiquido ?? 0,
      dataRecebimento: receita?.dataRecebimento ?? '',
      observacao: receita?.observacao ?? '',
    },
  })

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      reset({
        categoriaId: receita?.categoriaId ?? '',
        descricao: receita?.descricao ?? '',
        valorBruto: receita?.valorBruto ?? null,
        valorLiquido: receita?.valorLiquido ?? 0,
        dataRecebimento: receita?.dataRecebimento ?? '',
        observacao: receita?.observacao ?? '',
      })
      setDataRecebimento(
        receita?.dataRecebimento
          ? (parseDateOnly(receita.dataRecebimento) ?? undefined)
          : undefined,
      )
    }
  }

  const onSubmit = async (data: ReceitaFormData) => {
    if (isEditing) {
      await atualizarReceita({ id: receita.id, ...data })
    } else {
      await salvarReceita({ planejamentoMensalId, ...data })
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
            Nova receita
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar receita' : 'Nova receita'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel>Categoria *</FieldLabel>
                <div className="flex gap-2">
                  <Controller
                    name="categoriaId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
                  <CategoriaDialog
                    tipo={TIPOCATEGORIA.RECEITA}
                    label="receita"
                    onCreated={(categoriaId) =>
                      setValue('categoriaId', categoriaId)
                    }
                  />
                </div>
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
                <FieldLabel htmlFor="valorBruto">Valor bruto</FieldLabel>
                <Input
                  id="valorBruto"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('valorBruto')}
                />
                {errors.valorBruto && (
                  <p className="text-destructive text-sm">
                    {errors.valorBruto.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="valorLiquido">Valor líquido *</FieldLabel>
                <Input
                  id="valorLiquido"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('valorLiquido')}
                />
                {errors.valorLiquido && (
                  <p className="text-destructive text-sm">
                    {errors.valorLiquido.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="dataRecebimento">
                  Data de recebimento *
                </FieldLabel>
                <DatePicker
                  date={dataRecebimento}
                  setDate={(date) => {
                    setDataRecebimento(date)
                    if (date) {
                      setValue(
                        'dataRecebimento',
                        dayjs(date).format('YYYY-MM-DD'),
                      )
                    }
                  }}
                  placeholder="Selecione a data de recebimento"
                />
                {errors.dataRecebimento && (
                  <p className="text-destructive text-sm">
                    {errors.dataRecebimento.message}
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

export { ReceitaFormDialog }
