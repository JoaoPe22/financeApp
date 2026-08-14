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
import { useSalvarParcelamento } from '@/hooks/use-parcelamentos'
import { TIPOCATEGORIA } from '@/types/categoria'

const parcelamentoSchema = z.object({
  categoriaId: z.string().nonempty('Categoria é obrigatória'),
  descricao: z.string().nonempty('Descrição é obrigatória'),
  valorTotal: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0'),
  valorEntrada: z.coerce
    .number()
    .min(0, 'Entrada deve ser maior ou igual a 0')
    .nullable()
    .optional(),
  quantidadeParcelas: z.coerce.number().int().min(1, 'Deve ter pelo menos 1 parcela'),
  dataPrimeiraParcela: z.iso.date({ message: 'Data da primeira parcela é obrigatória' }),
})

type ParcelamentoFormData = z.infer<typeof parcelamentoSchema>

const ParcelamentoFormDialog = () => {
  const [open, setOpen] = useState(false)
  const [dataPrimeiraParcela, setDataPrimeiraParcela] = useState<Date | undefined>()
  const { data: categorias } = useCategorias('DESPESA')
  const { mutateAsync: salvarParcelamento, isPending } = useSalvarParcelamento()

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ParcelamentoFormData>({
    resolver: zodResolver(parcelamentoSchema),
    defaultValues: {
      categoriaId: '',
      descricao: '',
      valorTotal: 0,
      valorEntrada: null,
      quantidadeParcelas: 2,
      dataPrimeiraParcela: '',
    },
  })

  const onSubmit = async (data: ParcelamentoFormData) => {
    await salvarParcelamento(data)
    reset()
    setDataPrimeiraParcela(undefined)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus />
          Novo parcelamento
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo parcelamento</DialogTitle>
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
                  <CategoriaDialog
                    tipo={TIPOCATEGORIA.DESPESA}
                    label="despesa"
                    onCreated={(categoriaId) => setValue('categoriaId', categoriaId)}
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
                <FieldLabel htmlFor="valorTotal">Valor total *</FieldLabel>
                <Input
                  id="valorTotal"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('valorTotal')}
                />
                {errors.valorTotal && (
                  <p className="text-destructive text-sm">
                    {errors.valorTotal.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="valorEntrada">Valor de entrada</FieldLabel>
                <Input
                  id="valorEntrada"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('valorEntrada')}
                />
                {errors.valorEntrada && (
                  <p className="text-destructive text-sm">
                    {errors.valorEntrada.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="quantidadeParcelas">
                  Quantidade de parcelas *
                </FieldLabel>
                <Input
                  id="quantidadeParcelas"
                  type="number"
                  min="1"
                  {...register('quantidadeParcelas')}
                />
                {errors.quantidadeParcelas && (
                  <p className="text-destructive text-sm">
                    {errors.quantidadeParcelas.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="dataPrimeiraParcela">
                  Data da primeira parcela *
                </FieldLabel>
                <DatePicker
                  date={dataPrimeiraParcela}
                  setDate={(date) => {
                    setDataPrimeiraParcela(date)
                    if (date) {
                      setValue('dataPrimeiraParcela', dayjs(date).format('YYYY-MM-DD'))
                    }
                  }}
                  placeholder="Selecione a data da primeira parcela"
                />
                {errors.dataPrimeiraParcela && (
                  <p className="text-destructive text-sm">
                    {errors.dataPrimeiraParcela.message}
                  </p>
                )}
              </Field>
            </FieldGroup>
          </FieldSet>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { ParcelamentoFormDialog }
