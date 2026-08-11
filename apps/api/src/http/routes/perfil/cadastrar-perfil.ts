import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, perfil } from '@/database/schema'
import { tipoRendaEnum } from '@/database/schema/enums'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

const ufEnum = z.enum([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
])

const cadastrarPerfilBodySchema = z.object({
  dataNascimento: z.iso.date(),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  estado: ufEnum,
  cidade: z.string().min(1),
  bairro: z.string().min(1),
  logradouro: z.string().min(1),
  numero: z.string().min(1),
  complemento: z.string().max(255).optional(),
  tipoRenda: tipoRendaEnum,
  salarioFixo: z.coerce.number().min(0).optional(),
}).refine((data) => {
  const maiorDeIdade = new Date()
  maiorDeIdade.setFullYear(maiorDeIdade.getFullYear() - 18)
  return new Date(data.dataNascimento) <= maiorDeIdade
}, { message: 'É necessário ter pelo menos 18 anos', path: ['dataNascimento'] })

const cadastrarPerfil = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      '/perfil',
      {
        preHandler: authenticate,
        schema: {
          tags: ['Perfil'],
          summary: 'Cadastrar perfil',
          description: 'Endpoint para cadastrar um novo perfil de usuário.',
          body: cadastrarPerfilBodySchema,
          response: {
            201: z.void(),
          },
        },
      },
      async (request, reply) => {
        const { body } = request
        const userId = request.user!.id

        const [perfilExistente] = await db
          .select({ id: perfil.id })
          .from(perfil)
          .where(eq(perfil.userId, userId))
          .limit(1)

        if (perfilExistente) {
          throw new BadRequestError('Usuário já possui um perfil cadastrado')
        }

        const [novoPerfil] = await db
          .insert(perfil)
          .values({
            userId,
            dataNascimento: body.dataNascimento,
            cep: body.cep,
            estado: body.estado,
            cidade: body.cidade,
            bairro: body.bairro,
            logradouro: body.logradouro,
            numero: body.numero,
            complemento: body.complemento ?? null,
            tipoRenda: body.tipoRenda,
            salarioFixo: body.salarioFixo?.toString() ?? null,
          })
          .returning({ id: perfil.id })

        await db.insert(log).values({
          usuarioId: userId,
          entidade: 'perfil',
          entidadeId: novoPerfil.id,
          descricao: 'Perfil cadastrado com sucesso',
        })

        return reply.status(201).send()
      },
    )
}

export { cadastrarPerfil }
