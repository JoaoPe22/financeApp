import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createAuthMiddleware } from 'better-auth/api'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { v7 as uuidv7 } from 'uuid'

import { envServer } from '@/lib/env-server'
import { sendEmail } from '@/lib/mail'
import {
  resetPasswordTemplate,
  resetPasswordTextTemplate,
} from '@/lib/mail-templates'

import * as authSchema from './schema'

declare global {
  var _bsyPool: Pool | undefined
}

// ponytail: globalThis guard prevents HMR from leaking pg.Pool instances (each holds 10 idle connections)
const pool = (globalThis._bsyPool ??= new Pool({
  connectionString: envServer.DATABASE_URL,
}))

// As migrations (geradas em apps/api com casing: 'camelCase') criaram as colunas
// como "emailVerified", "createdAt" etc. — sem isso, toda consulta (login, cadastro,
// sessão) falha com "column does not exist".
const db = drizzle(pool, { schema: authSchema, casing: 'camelCase' })

type LogParams = {
  acao: string;
  usuarioAfetadoId?: string;
  usuarioAfetadoEmail?: string;
  usuarioExecutorId?: string;
  usuarioExecutorEmail?: string;
  detalhes?: string;
  ipAddress?: string;
  userAgent?: string;
}

const logUsuario = async (params: LogParams) => {
  try {
    // logs_usuarios foi substituída pela tabela "log" centralizada (ver api/src/db/schema/log.ts)
    const descricao = [
      params.acao,
      params.usuarioAfetadoEmail &&
        `Usuário afetado: ${params.usuarioAfetadoEmail}`,
      params.usuarioExecutorEmail && `Executor: ${params.usuarioExecutorEmail}`,
      params.ipAddress && `IP: ${params.ipAddress}`,
      params.userAgent && `User-Agent: ${params.userAgent}`,
      params.detalhes && `Detalhes: ${params.detalhes}`,
    ]
      .filter(Boolean)
      .join('\n')

    await pool.query(
      `INSERT INTO "log" (id, entidade, "entidadeId", "usuarioId", acao, descricao)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        uuidv7(),
        'usuarios',
        params.usuarioAfetadoId ?? params.usuarioExecutorId ?? 'sistema',
        params.usuarioExecutorId ?? null,
        'AUTENTICACAO',
        descricao,
      ],
    )
  } catch (error) {
    console.error('Erro ao registrar log de usuário:', error)
  }
}

const auth = betterAuth({
  secret: envServer.BETTER_AUTH_SECRET,
  baseURL: envServer.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: 'pg' }),
  session: {
    expiresIn: 60 * 60 * 4,
    updateAge: 60 * 5,
  },
  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      const resetUrl = url.replace(
        `${envServer.BETTER_AUTH_URL}/reset-password`,
        `${envServer.BETTER_AUTH_URL}/redefinir-senha?token`,
      )

      await logUsuario({
        acao: `Solicitação de redefinição de senha - ${user.name} (${user.email})`,
        usuarioAfetadoId: user.id,
        usuarioAfetadoEmail: user.email,
        detalhes: 'Usuário solicitou redefinição de senha via formulário',
      })

      sendEmail({
        to: user.email,
        subject: 'Redefinição de Senha - BSY Consultoria',
        html: resetPasswordTemplate({
          userName: user.name,
          resetUrl,
          expiresIn: '1 hora',
        }),
        text: resetPasswordTextTemplate({
          userName: user.name,
          resetUrl,
          expiresIn: '1 hora',
        }),
      })
    },
    onPasswordReset: async ({ user }) => {
      await logUsuario({
        acao: `Senha redefinida com sucesso - ${user.name} (${user.email})`,
        usuarioAfetadoId: user.id,
        usuarioAfetadoEmail: user.email,
        detalhes: 'Usuário completou o processo de redefinição de senha',
      })

      sendEmail({
        to: user.email,
        subject: 'Senha Alterada - BSY Consultoria',
        html: `<p>Olá ${user.name},</p><p>Sua senha foi alterada com sucesso em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' })}.</p><p>Se você não realizou esta alteração, entre em contato conosco imediatamente.</p>`,
        text: `Sua senha foi alterada com sucesso em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' })}.`,
      })
    },
  },

  rateLimit: {
    enabled: true,
    storage: 'memory',
    window: 60,
    max: 100,
    customRules: {
      '/sign-in/email': { window: 60, max: 10 },
      '/forget-password': { window: 60, max: 5 },
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // @ts-expect-error - Headers podem ser undefined, então precisamos fazer uma verificação de tipo
      const ipAddress = ctx.headers?.['x-forwarded-for'] as string | undefined
      // @ts-expect-error - Headers podem ser undefined, então precisamos fazer uma verificação de tipo
      const userAgent = ctx.headers?.['user-agent'] as string | undefined

      if (ctx.path === '/sign-in/email' && ctx.context.newSession) {
        const user = ctx.context.newSession.user
        await logUsuario({
          acao: `Login realizado - ${user.name} (${user.email})`,
          usuarioAfetadoId: user.id,
          usuarioAfetadoEmail: user.email,
          detalhes: `Usuário autenticado com sucesso | IP: ${ipAddress || 'Não disponível'}`,
          ipAddress,
          userAgent,
        })
      }

      if (ctx.path === '/sign-out' && ctx.context.session?.user) {
        const user = ctx.context.session.user
        await logUsuario({
          acao: `Logout - ${user.name} (${user.email})`,
          usuarioAfetadoId: user.id,
          usuarioAfetadoEmail: user.email,
          detalhes: 'Usuário encerrou a sessão',
          ipAddress,
          userAgent,
        })
      }
    }),
  },
})

export { auth }
