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
import {
  useAtualizarContaBancaria,
  useSalvarContaBancaria,
} from '@/hooks/use-contas-bancarias'
import { ContaBancaria } from '@/types/conta-bancaria'

const contaBancariaSchema = z.object({
  banco: z.string().nonempty('Banco é obrigatório'),
  agencia: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  conta: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
  apelido: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
})

type ContaBancariaFormData = z.infer<typeof contaBancariaSchema>
type ContaBancariaFormInput = z.input<typeof contaBancariaSchema>

interface ContaBancariaFormDialogProps {
  contaBancaria?: ContaBancaria
}

const ContaBancariaFormDialog = ({
  contaBancaria,
}: ContaBancariaFormDialogProps) => {
  const [open, setOpen] = useState(false)
  const isEditing = !!contaBancaria
  const { mutateAsync: salvarContaBancaria, isPending: isSaving } =
    useSalvarContaBancaria()
  const { mutateAsync: atualizarContaBancaria, isPending: isUpdating } =
    useAtualizarContaBancaria()
  const isPending = isSaving || isUpdating

  const valoresIniciais = () => ({
    banco: contaBancaria?.banco ?? '',
    agencia: contaBancaria?.agencia ?? '',
    conta: contaBancaria?.conta ?? '',
    apelido: contaBancaria?.apelido ?? '',
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContaBancariaFormInput, unknown, ContaBancariaFormData>({
    resolver: zodResolver(contaBancariaSchema),
    defaultValues: valoresIniciais(),
  })

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      reset(valoresIniciais())
    }
  }

  const onSubmit = async (data: ContaBancariaFormData) => {
    if (isEditing) {
      await atualizarContaBancaria({ id: contaBancaria.id, ...data })
    } else {
      await salvarContaBancaria(data)
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
              Nova conta
            </Button>
            )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar conta bancária' : 'Nova conta bancária'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="banco">Banco *</FieldLabel>
                <Input
                  id="banco"
                  placeholder="Ex.: Nubank"
                  {...register('banco')}
                />
                {errors.banco && (
                  <p className="text-destructive text-sm">
                    {errors.banco.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="agencia">Agência</FieldLabel>
                <Input
                  id="agencia"
                  placeholder="Ex.: 0001"
                  {...register('agencia')}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="conta">Conta</FieldLabel>
                <Input
                  id="conta"
                  placeholder="Ex.: 12345-6"
                  {...register('conta')}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="apelido">Apelido do cartão</FieldLabel>
                <Input
                  id="apelido"
                  placeholder="Ex.: Nubank roxinho"
                  {...register('apelido')}
                />
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

export { ContaBancariaFormDialog }
