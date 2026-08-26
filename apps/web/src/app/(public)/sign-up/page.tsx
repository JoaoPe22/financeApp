'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/auth/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const signUpSchema = z
  .object({
    name: z.string().min(1, 'O nome é obrigatório'),
    email: z
      .email('Formato de e-mail inválido')
      .min(1, 'O e-mail é obrigatório'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'A confirmação de senha é obrigatória'),
    acceptedTerms: z.boolean().refine((value) => value === true, {
      message:
        'Você precisa aceitar os Termos de Uso e a Política de Privacidade',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type SignUpFormData = z.infer<typeof signUpSchema>

const Page = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
  })

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      const response = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      })

      if (response.error) {
        console.error('Erro ao criar conta:', response.error)
        toast.error(
          response.error.message || 'Erro ao criar conta. Tente novamente.',
        )
        return
      }

      queryClient.clear()

      toast.success(
        'Conta criada! Enviamos um link de confirmação para o seu e-mail.',
      )
      router.push('/sign-in')
      router.refresh()
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      toast.error('Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <main className="grid min-h-screen w-full lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gray-300 lg:flex" />

      <section className="flex items-center justify-center bg-zinc-100 p-10">
        <Card className="w-80 max-w-md rounded-xl shadow-xl">
          <CardHeader className="space-y-6 text-center">
            {/* LOGO */}
          </CardHeader>

          <CardTitle className="text-center text-3xl">Criar conta</CardTitle>

          <CardContent>
            <form onSubmit={handleSubmit(handleSignUp)} method="post">
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nome</FieldLabel>
                    <Input
                      id="name"
                      {...register('name')}
                      disabled={isSubmitting}
                    />
                    {errors.name && <span>{errors.name.message}</span>}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      disabled={isSubmitting}
                    />
                    {errors.email && <span>{errors.email.message}</span>}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
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
                      Confirmar senha
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

                  <Field orientation="horizontal">
                    <Controller
                      name="acceptedTerms"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="acceptedTerms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    <FieldLabel
                      htmlFor="acceptedTerms"
                      className="font-normal"
                    >
                      Li e concordo com os{' '}
                      <Link
                        href="/termos-de-uso"
                        className="underline"
                        target="_blank"
                      >
                        Termos de Uso
                      </Link>{' '}
                      e a{' '}
                      <Link
                        href="/politica-de-privacidade"
                        className="underline"
                        target="_blank"
                      >
                        Política de Privacidade
                      </Link>
                    </FieldLabel>
                  </Field>
                  {errors.acceptedTerms && (
                    <span>{errors.acceptedTerms.message}</span>
                  )}
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
                  Criar conta
                </Button>

                <Link
                  href="/sign-in"
                  className="text-muted-foreground block text-center text-sm hover:underline"
                  prefetch={false}
                >
                  Já tenho uma conta
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export default Page
