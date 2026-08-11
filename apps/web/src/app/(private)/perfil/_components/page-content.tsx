'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type PerfilFormData, perfilSchema, useSavePerfil } from '@/hooks/use-perfil'
import { buscaCep } from '@/lib/cep'
import { extractErrorMessage } from '@/lib/error-handler'

const ESTADOS_BR = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

const TIPOS_RENDA = [
  { value: 'SALARIO', label: 'Salário (CLT)' },
  { value: 'AUTONOMO', label: 'Autônomo' },
  { value: 'RENDIMENTO', label: 'Rendimento' },
  { value: 'OUTRO', label: 'Outro' },
]

const PageContent = () => {
  const router = useRouter()
  const { mutateAsync: savePerfil, isPending } = useSavePerfil()

  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
  })

  const cepValue = watch('cep')

  const consultarCEP = async () => {
    if (!/^\d{8}$/.test(cepValue ?? '')) {
      toast.error('CEP inválido')
      return
    }

    try {
      const data = await buscaCep(cepValue)
      setValue('estado', data.uf, { shouldValidate: true })
      setValue('cidade', data.localidade, { shouldValidate: true })
      setValue('bairro', data.bairro, { shouldValidate: true })
      setValue('logradouro', data.logradouro, { shouldValidate: true })
      toast.success('Endereço preenchido automaticamente!')
    } catch (error) {
      const message = await extractErrorMessage(error)
      toast.error(message)
    }
  }

  const onSubmit = async (data: PerfilFormData) => {
    await savePerfil(data)
    router.push('/')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-10">
      <Card className="w-full max-w-2xl rounded-xl shadow-xl">
        <CardHeader className="space-y-6 text-center" />

        <CardTitle className="text-center text-3xl">Meu perfil</CardTitle>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} method="post">
            <FieldSet>
              <FieldGroup className="@container grid grid-cols-1 gap-4 @md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="dataNascimento">Data de nascimento</FieldLabel>
                  <Input id="dataNascimento" type="date" {...register('dataNascimento')} disabled={isPending} />
                  {errors.dataNascimento && <span>{errors.dataNascimento.message}</span>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="tipoRenda">Tipo de renda</FieldLabel>
                  <Controller
                    name="tipoRenda"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                        <SelectTrigger id="tipoRenda" className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_RENDA.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.tipoRenda && <span>{errors.tipoRenda.message}</span>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="salarioFixo">Salário fixo (se houver)</FieldLabel>
                  <Input
                    id="salarioFixo"
                    type="number"
                    step="0.01"
                    {...register('salarioFixo')}
                    disabled={isPending}
                  />
                  {errors.salarioFixo && <span>{errors.salarioFixo.message}</span>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="cep">CEP</FieldLabel>
                  <div className="flex gap-2">
                    <Input id="cep" {...register('cep')} disabled={isPending} />
                    <Button type="button" variant="outline" onClick={consultarCEP} disabled={isPending}>
                      Buscar
                    </Button>
                  </div>
                  {errors.cep && <span>{errors.cep.message}</span>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="estado">Estado</FieldLabel>
                  <Controller
                    name="estado"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                        <SelectTrigger id="estado" className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS_BR.map((estado) => (
                            <SelectItem key={estado.value} value={estado.value}>
                              {estado.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.estado && <span>{errors.estado.message}</span>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
                  <Input id="cidade" {...register('cidade')} disabled={isPending} />
                  {errors.cidade && <span>{errors.cidade.message}</span>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="bairro">Bairro</FieldLabel>
                  <Input id="bairro" {...register('bairro')} disabled={isPending} />
                  {errors.bairro && <span>{errors.bairro.message}</span>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="logradouro">Logradouro</FieldLabel>
                  <Input id="logradouro" {...register('logradouro')} disabled={isPending} />
                  {errors.logradouro && <span>{errors.logradouro.message}</span>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="numero">Número</FieldLabel>
                  <Input id="numero" {...register('numero')} disabled={isPending} />
                  {errors.numero && <span>{errors.numero.message}</span>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="complemento">Complemento</FieldLabel>
                  <Input id="complemento" {...register('complemento')} disabled={isPending} />
                  {errors.complemento && <span>{errors.complemento.message}</span>}
                </Field>
              </FieldGroup>
            </FieldSet>

            <div className="pt-5">
              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                Salvar perfil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

export { PageContent }
