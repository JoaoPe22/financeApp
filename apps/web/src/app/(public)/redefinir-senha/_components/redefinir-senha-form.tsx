'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/auth/client'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const redefinirSenhaSchema = z
  .object({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'A confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type RedefinirSenhaFormData = z.infer<typeof redefinirSenhaSchema>

const RedefinirSenhaForm = () => {
  const router = useRouter()
  const token = useSearchParams().get('token')
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
  } = useForm<RedefinirSenhaFormData>({
    resolver: zodResolver(redefinirSenhaSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const handleRedefinirSenha = async (data: RedefinirSenhaFormData) => {
    if (!token) return

    try {
      const response = await authClient.resetPassword({
        newPassword: data.password,
        token,
      })

      if (response.error) {
        toast.error(
          response.error.message ||
            'Não foi possível redefinir a senha. Solicite um novo link.',
        )
        return
      }

      toast.success('Senha redefinida com sucesso! Faça login novamente.')
      router.push('/sign-in')
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      toast.error('Erro ao redefinir a senha. Tente novamente.')
    }
  }

  if (!token) {
    return (
      <div className="space-y-5 text-center">
        <p className="text-muted-foreground text-sm">
          Este link de redefinição é inválido ou expirou.
        </p>
        <Link
          href="/esqueci-a-senha"
          className="text-muted-foreground block text-center text-sm hover:underline"
          prefetch={false}
        >
          Solicitar um novo link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleRedefinirSenha)} method="post">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">Nova senha</FieldLabel>
            <Input
              id="password"
              type="password"
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password && <span>{errors.password.message}</span>}
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">
              Confirmar nova senha
            </FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <span>{errors.confirmPassword.message}</span>
            )}
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="space-y-5 pt-3">
        <Button
          className="w-full"
          type="submit"
          variant="secondary"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="animate-spin" />}
          Redefinir senha
        </Button>
      </div>
    </form>
  )
}

export { RedefinirSenhaForm }
