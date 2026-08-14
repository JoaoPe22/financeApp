'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

import { CidadeSelect } from '@/components/cidade-select'
import { EstadoSelect } from '@/components/estado-select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { usePerfil, useSavePerfil, useUpdatePerfil } from '@/hooks/use-perfil'
import { buscaCep } from '@/lib/cep'
import { dayjs, parseDateOnly } from '@/lib/dayjs'
import { extractErrorMessage } from '@/lib/error-handler'
import { TIPORENDA } from '@/types/perfil'

const TIPO_RENDA_LABELS: Record<string, string> = {
  [TIPORENDA.SALARIO]: 'Salário',
  [TIPORENDA.AUTONOMO]: 'Autônomo',
  [TIPORENDA.RENDIMENTO]: 'Rendimento',
  [TIPORENDA.OUTRO]: 'Outro',
}

const perfilSchema = z
  .object({
    dataNascimento: z.iso.date({ message: 'Data de nascimento inválida' }),
    cep: z.string().nonempty('CEP é obrigatório'),
    estado: z.string({ error: 'Estado é obrigatório' }).nonempty('Estado é obrigatório'),
    cidade: z.string({ error: 'Cidade é obrigatória' }).nonempty('Cidade é obrigatória'),
    bairro: z.string().nonempty('Bairro é obrigatório'),
    logradouro: z.string().nonempty('Logradouro é obrigatório'),
    numero: z.string().nonempty('Número é obrigatório'),
    complemento: z
      .string()
      .nullable()
      .transform((val) => val || null),
    tipoRenda: z.enum(
      [
        TIPORENDA.SALARIO,
        TIPORENDA.AUTONOMO,
        TIPORENDA.RENDIMENTO,
        TIPORENDA.OUTRO,
      ],
      { error: 'Tipo de renda inválido' },
    ),
    salarioFixo: z.coerce.number().min(0).optional(),
  })
  .refine(
    (data) => {
      const maiorDeIdade = new Date()
      maiorDeIdade.setFullYear(maiorDeIdade.getFullYear() - 18)
      return new Date(data.dataNascimento) <= maiorDeIdade
    },
    {
      message: 'É necessário ter pelo menos 18 anos',
      path: ['dataNascimento'],
    },
  )

type PerfilFormInput = z.input<typeof perfilSchema>
type PerfilFormData = z.output<typeof perfilSchema>

const PageContent = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<PerfilFormInput, unknown, PerfilFormData>({
    resolver: zodResolver(perfilSchema),
  })
  const [dataNascimento, setDataNascimento] = useState<Date | undefined>()
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { data: perfil, isLoading: isLoadingPerfil } = usePerfil()
  const { mutateAsync: savePerfil, isPending: isSaving } = useSavePerfil()
  const { mutateAsync: updatePerfil, isPending: isUpdating } = useUpdatePerfil()
  const isPending = isSaving || isUpdating

  const onSubmit = (data: PerfilFormData) =>
    perfil ? updatePerfil(data) : savePerfil(data)

  const onInvalid = () => {
    toast.error('Verifique os campos obrigatórios do formulário')
  }

  const estadoValue = watch('estado')

  useEffect(() => {
    if (isLoadingPerfil) return

    if (perfil) {
      const parsedDate = parseDateOnly(perfil.dataNascimento)
      reset({
        dataNascimento: parsedDate
          ? dayjs(parsedDate).format('YYYY-MM-DD')
          : perfil.dataNascimento,
        cep: perfil.cep,
        estado: perfil.estado,
        cidade: perfil.cidade,
        bairro: perfil.bairro,
        logradouro: perfil.logradouro,
        numero: perfil.numero,
        complemento: perfil.complemento || '',
        tipoRenda: perfil.tipoRenda,
        salarioFixo: perfil.salarioFixo ?? undefined,
      })
      setDataNascimento(parsedDate || undefined)
    } else {
      reset()
    }
    setIsInitialized(true)
  }, [perfil, isLoadingPerfil, reset])

  const consultarCEP = async () => {
    const cep = watch('cep')
    try {
      const cepRegex = z.object({
        cep: z.string().regex(/^\d{5}-?\d{3}$/),
      })

      if (!cepRegex.safeParse({ cep }).success) {
        return toast.error('CEP inválido')
      }

      toast.info('Consultando CEP...')
      setIsLoadingCEP(true)

      await buscaCep(cep).then((data) => {
        setValue('logradouro', data.logradouro)
        setValue('bairro', data.bairro)
        setValue('cidade', data.localidade)
        setValue('estado', data.uf)
        setValue('complemento', data.complemento)
      })

      toast.success('Informações de endereço atualizadas com sucesso!')
    } catch (error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    } finally {
      setIsLoadingCEP(false)
    }
  }

  if (isLoadingPerfil || !isInitialized) {
    return (
      <Card className="w-full max-w-2xl rounded-xl shadow-xl">
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl rounded-xl shadow-xl">
      <CardHeader className="text-center" />

      <CardTitle className="text-center text-3xl">Meu perfil</CardTitle>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} method="post">
          <FieldSet>
            <FieldGroup className="@container grid grid-cols-1 gap-4 @md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="dataNascimento">
                  Data de nascimento *
                </FieldLabel>
                <DatePicker
                  date={dataNascimento}
                  setDate={(date) => {
                    setDataNascimento(date)
                    if (date) {
                      setValue(
                        'dataNascimento',
                        dayjs(date).format('YYYY-MM-DD'),
                      )
                    }
                  }}
                  placeholder="Selecione a data de nascimento"
                />
                {errors.dataNascimento && (
                  <p className="text-destructive text-sm">
                    {errors.dataNascimento.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="tipoRenda">Tipo de renda *</FieldLabel>
                <Controller
                  name="tipoRenda"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="tipoRenda" className="w-full">
                        <SelectValue placeholder="Selecione o tipo de renda">
                          {field.value && TIPO_RENDA_LABELS[field.value]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TIPORENDA.SALARIO}>
                          Salário
                        </SelectItem>
                        <SelectItem value={TIPORENDA.AUTONOMO}>
                          Autônomo
                        </SelectItem>
                        <SelectItem value={TIPORENDA.RENDIMENTO}>
                          Rendimento
                        </SelectItem>
                        <SelectItem value={TIPORENDA.OUTRO}>Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.tipoRenda && (
                  <p className="text-destructive text-sm">
                    {errors.tipoRenda.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="salarioFixo">
                  Salário fixo (se houver)
                </FieldLabel>
                <Input
                  id="salarioFixo"
                  type="number"
                  step="0.01"
                  {...register('salarioFixo')}
                />
                {errors.salarioFixo && (
                  <p className="text-destructive text-sm">
                    {errors.salarioFixo.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="">CEP *</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    {...register('cep')}
                    aria-invalid={!!errors.cep}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isLoadingCEP || !watch('cep')}
                    onClick={() => consultarCEP()}
                  >
                    {isLoadingCEP && <Loader2 className="animate-spin" />}
                    Consultar CEP
                  </Button>
                </div>
                {errors.cep && (
                  <p className="text-destructive text-sm">
                    {errors.cep.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel>Estado *</FieldLabel>
                <EstadoSelect
                  value={estadoValue || ''}
                  onChange={(v) => {
                    setValue('estado', v)
                    setValue('cidade', '')
                  }}
                />
                {errors.estado && (
                  <p className="text-destructive text-sm">
                    {errors.estado.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel>Cidade *</FieldLabel>
                <CidadeSelect
                  value={watch('cidade') || ''}
                  onChange={(v) => setValue('cidade', v)}
                  uf={estadoValue || ''}
                />
                {errors.cidade && (
                  <p className="text-destructive text-sm">
                    {errors.cidade.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="bairro">Bairro *</FieldLabel>
                <Input id="bairro" {...register('bairro')} />
                {errors.bairro && (
                  <p className="text-destructive text-sm">
                    {errors.bairro.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="logradouro">Logradouro *</FieldLabel>
                <Input id="logradouro" {...register('logradouro')} />
                {errors.logradouro && (
                  <p className="text-destructive text-sm">
                    {errors.logradouro.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="numero">Número *</FieldLabel>
                <Input id="numero" {...register('numero')} />
                {errors.numero && (
                  <p className="text-destructive text-sm">
                    {errors.numero.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="complemento">Complemento</FieldLabel>
                <Input id="complemento" {...register('complemento')} />
                {errors.complemento && (
                  <p className="text-destructive text-sm">
                    {errors.complemento.message}
                  </p>
                )}
              </Field>
            </FieldGroup>
          </FieldSet>

          <div className="pt-5">
            <Button
              className="w-full"
              type="submit"
              variant="secondary"
              disabled={isPending}
            >
              {isPending && <Loader2 className="animate-spin" />}
              Salvar perfil
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export { PageContent }
