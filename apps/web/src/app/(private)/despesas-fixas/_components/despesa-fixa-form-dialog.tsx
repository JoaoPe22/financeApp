'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
  useAtualizarDespesaFixa,
  useSalvarDespesaFixa,
} from '@/hooks/use-despesas-fixas'
import { DespesaFixa } from '@/types/despesa-fixa'

import { CategoriaDialog } from './categoria-dialog'

const despesaFixaSchema = z.object({
  categoriaId: z.string().nonempty('Categoria é obrigatória'),
  descricao: z.string().nonempty('Descrição é obrigatória'),
  valor: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0'),
  diaVencimento: z.coerce
    .number()
    .int()
    .min(1, 'Dia deve ser entre 1 e 31')
    .max(31, 'Dia deve ser entre 1 e 31'),
  obrigatoria: z.boolean(),
  ativa: z.boolean(),
})

type DespesaFixaFormData = z.infer<typeof despesaFixaSchema>

interface DespesaFixaFormDialogProps {
  despesaFixa?: DespesaFixa
}

const DespesaFixaFormDialog = ({ despesaFixa }: DespesaFixaFormDialogProps) => {
  const [open, setOpen] = useState(false)
  const isEditing = !!despesaFixa
  const { data: categorias } = useCategorias('DESPESA')
  const { mutateAsync: salvarDespesaFixa, isPending: isSaving } =
    useSalvarDespesaFixa()
  const { mutateAsync: atualizarDespesaFixa, isPending: isUpdating } =
    useAtualizarDespesaFixa()
  const isPending = isSaving || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<DespesaFixaFormData>({
    resolver: zodResolver(despesaFixaSchema),
    defaultValues: {
      categoriaId: despesaFixa?.categoriaId ?? '',
      descricao: despesaFixa?.descricao ?? '',
      valor: despesaFixa?.valor ?? 0,
      diaVencimento: despesaFixa?.diaVencimento ?? 1,
      obrigatoria: despesaFixa?.obrigatoria ?? true,
      ativa: despesaFixa?.ativa ?? true,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        categoriaId: despesaFixa?.categoriaId ?? '',
        descricao: despesaFixa?.descricao ?? '',
        valor: despesaFixa?.valor ?? 0,
        diaVencimento: despesaFixa?.diaVencimento ?? 1,
        obrigatoria: despesaFixa?.obrigatoria ?? true,
        ativa: despesaFixa?.ativa ?? true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = async (data: DespesaFixaFormData) => {
    if (isEditing) {
      await atualizarDespesaFixa({ id: despesaFixa.id, ...data })
    } else {
      await salvarDespesaFixa(data)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              Nova despesa fixa
            </Button>
            )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar despesa fixa' : 'Nova despesa fixa'}
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
                    onCreated={(categoriaId) =>
                      setValue('categoriaId', categoriaId)}
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
                <FieldLabel htmlFor="diaVencimento">
                  Dia do vencimento *
                </FieldLabel>
                <Input
                  id="diaVencimento"
                  type="number"
                  min="1"
                  max="31"
                  {...register('diaVencimento')}
                />
                {errors.diaVencimento && (
                  <p className="text-destructive text-sm">
                    {errors.diaVencimento.message}
                  </p>
                )}
              </Field>

              <Field orientation="horizontal">
                <Controller
                  name="obrigatoria"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="obrigatoria"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <FieldLabel htmlFor="obrigatoria">
                  Obrigatória (não pode deixar de pagar)
                </FieldLabel>
              </Field>

              <Field orientation="horizontal">
                <Controller
                  name="ativa"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="ativa"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <FieldLabel htmlFor="ativa">
                  Ativa (entra no planejamento dos próximos meses)
                </FieldLabel>
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

export { DespesaFixaFormDialog }
