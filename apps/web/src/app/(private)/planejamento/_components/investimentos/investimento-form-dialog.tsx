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
  useAtualizarInvestimento,
  useSalvarInvestimento,
} from '@/hooks/use-investimentos'
import { TIPOCATEGORIA } from '@/types/categoria'
import { Investimento } from '@/types/investimento'

const investimentoSchema = z
  .object({
    categoriaId: z.string().nonempty('Categoria é obrigatória'),
    instituicaoFinanceira: z
      .string()
      .nonempty('Instituição financeira é obrigatória'),
    descricao: z.string().nonempty('Descrição é obrigatória'),
    valorAplicado: z.coerce
      .number()
      .min(0, 'Valor deve ser maior ou igual a 0'),
    rentabilidade: z.coerce
      .number()
      .min(0, 'Rentabilidade deve ser maior ou igual a 0'),
    indexador: z.string().nonempty('Indexador é obrigatório'),
    liquidez: z.string().nonempty('Liquidez é obrigatória'),
    dataAplicacao: z.iso.date({
      message: 'Data de aplicação é obrigatória',
    }),
    dataVencimento: z.iso.date({
      message: 'Data de vencimento é obrigatória',
    }),
  })
  .refine((data) => data.dataVencimento >= data.dataAplicacao, {
    message: 'A data de vencimento não pode ser anterior à data de aplicação',
    path: ['dataVencimento'],
  })

type InvestimentoFormData = z.infer<typeof investimentoSchema>

interface InvestimentoFormDialogProps {
  investimento?: Investimento
}

const InvestimentoFormDialog = ({
  investimento,
}: InvestimentoFormDialogProps) => {
  const [open, setOpen] = useState(false)
  const [dataAplicacao, setDataAplicacao] = useState<Date | undefined>()
  const [dataVencimento, setDataVencimento] = useState<Date | undefined>()
  const isEditing = !!investimento
  const { data: categorias } = useCategorias('INVESTIMENTO')
  const { mutateAsync: salvarInvestimento, isPending: isSaving } =
    useSalvarInvestimento()
  const { mutateAsync: atualizarInvestimento, isPending: isUpdating } =
    useAtualizarInvestimento()
  const isPending = isSaving || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<InvestimentoFormData>({
    resolver: zodResolver(investimentoSchema),
    defaultValues: {
      categoriaId: investimento?.categoriaId ?? '',
      instituicaoFinanceira: investimento?.instituicaoFinanceira ?? '',
      descricao: investimento?.descricao ?? '',
      valorAplicado: investimento?.valorAplicado ?? 0,
      rentabilidade: investimento?.rentabilidade ?? 0,
      indexador: investimento?.indexador ?? '',
      liquidez: investimento?.liquidez ?? '',
      dataAplicacao: investimento?.dataAplicacao ?? '',
      dataVencimento: investimento?.dataVencimento ?? '',
    },
  })

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      reset({
        categoriaId: investimento?.categoriaId ?? '',
        instituicaoFinanceira: investimento?.instituicaoFinanceira ?? '',
        descricao: investimento?.descricao ?? '',
        valorAplicado: investimento?.valorAplicado ?? 0,
        rentabilidade: investimento?.rentabilidade ?? 0,
        indexador: investimento?.indexador ?? '',
        liquidez: investimento?.liquidez ?? '',
        dataAplicacao: investimento?.dataAplicacao ?? '',
        dataVencimento: investimento?.dataVencimento ?? '',
      })
      setDataAplicacao(
        investimento?.dataAplicacao
          ? dayjs(investimento.dataAplicacao).toDate()
          : undefined,
      )
      setDataVencimento(
        investimento?.dataVencimento
          ? dayjs(investimento.dataVencimento).toDate()
          : undefined,
      )
    }
  }

  const onSubmit = async (data: InvestimentoFormData) => {
    if (isEditing) {
      await atualizarInvestimento({ id: investimento.id, ...data })
    } else {
      await salvarInvestimento(data)
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
              Novo investimento
            </Button>
            )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar investimento' : 'Novo investimento'}
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
                    tipo={TIPOCATEGORIA.INVESTIMENTO}
                    label="investimento"
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
                <FieldLabel htmlFor="instituicaoFinanceira">
                  Instituição financeira *
                </FieldLabel>
                <Input
                  id="instituicaoFinanceira"
                  {...register('instituicaoFinanceira')}
                />
                {errors.instituicaoFinanceira && (
                  <p className="text-destructive text-sm">
                    {errors.instituicaoFinanceira.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="valorAplicado">
                  Valor aplicado *
                </FieldLabel>
                <Input
                  id="valorAplicado"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('valorAplicado')}
                />
                {errors.valorAplicado && (
                  <p className="text-destructive text-sm">
                    {errors.valorAplicado.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="rentabilidade">
                  Rentabilidade (%) *
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

              <Field>
                <FieldLabel htmlFor="indexador">Indexador *</FieldLabel>
                <Input
                  id="indexador"
                  placeholder="Ex.: CDI, SELIC, IPCA, PREFIXADO"
                  {...register('indexador')}
                />
                {errors.indexador && (
                  <p className="text-destructive text-sm">
                    {errors.indexador.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="liquidez">Liquidez *</FieldLabel>
                <Input
                  id="liquidez"
                  placeholder="Ex.: Diária, No vencimento"
                  {...register('liquidez')}
                />
                {errors.liquidez && (
                  <p className="text-destructive text-sm">
                    {errors.liquidez.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="dataAplicacao">
                  Data de aplicação *
                </FieldLabel>
                <DatePicker
                  date={dataAplicacao}
                  setDate={(date) => {
                    setDataAplicacao(date)
                    if (date) {
                      setValue(
                        'dataAplicacao',
                        dayjs(date).format('YYYY-MM-DD'),
                      )
                    }
                  }}
                  placeholder="Selecione a data de aplicação"
                />
                {errors.dataAplicacao && (
                  <p className="text-destructive text-sm">
                    {errors.dataAplicacao.message}
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
                    setDataVencimento(date)
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

export { InvestimentoFormDialog }
