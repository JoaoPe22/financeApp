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
import { useSalvarCategoria } from '@/hooks/use-categorias'
import { TipoCategoria } from '@/types/categoria'

const categoriaSchema = z.object({
  nome: z.string().nonempty('Nome é obrigatório'),
  cor: z.string().nonempty('Cor é obrigatória'),
})

type CategoriaFormData = z.infer<typeof categoriaSchema>

interface CategoriaDialogProps {
  tipo: TipoCategoria
  label: string
  onCreated: (categoriaId: string) => void
}

const CategoriaDialog = ({ tipo, label, onCreated }: CategoriaDialogProps) => {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: { nome: '', cor: '#64748b' },
  })
  const { mutateAsync: salvarCategoria, isPending } = useSalvarCategoria()

  const onSubmit = async (data: CategoriaFormData) => {
    const categoria = await salvarCategoria({
      nome: data.nome,
      tipo,
      cor: data.cor,
      // ponytail: sem seletor de ícone ainda, categoria assume um ícone
      // padrão até a UI de escolha de ícone ser pedida
      icone: 'Tag',
    })
    onCreated(categoria.id)
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus />
          Nova categoria
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova categoria de {label}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            // Este form fica dentro do <form> pai na árvore React (ambos os
            // <DialogContent> são portais para o body, então não há
            // aninhamento no DOM) — sem stopPropagation, o evento de submit
            // sobe pela árvore React via portal e também dispara o form pai.
            event.stopPropagation()
            handleSubmit(onSubmit)(event)
          }}
        >
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="categoria-nome">Nome</FieldLabel>
                <Input id="categoria-nome" {...register('nome')} />
                {errors.nome && (
                  <p className="text-destructive text-sm">
                    {errors.nome.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="categoria-cor">Cor</FieldLabel>
                <Input
                  id="categoria-cor"
                  type="color"
                  className="h-9 p-1"
                  style={{ width: '4rem' }}
                  {...register('cor')}
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Criar categoria
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { CategoriaDialog }
