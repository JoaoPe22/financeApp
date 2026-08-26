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
  verifyEmailTemplate,
  verifyEmailTextTemplate,
} from '@/lib/mail-templates'

import * as authSchema from './schema'

// Esta é a instância "fonte da verdade" do better-auth: emite sessão, cuida de
// cadastro/login/logout, reset de senha (com envio de e-mail) e rate limit.
// A API (apps/api/src/auth/index.ts) tem uma segunda instância, mais enxuta,
// só pra validar a sessão emitida aqui (mesmo banco + mesmo
// BETTER_AUTH_SECRET) — por isso rateLimit, emailAndPassword e hooks só
// precisam estar configurados neste lado.

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
  acao: string
  usuarioAfetadoId?: string
  usuarioAfetadoEmail?: string
  usuarioExecutorId?: string
  usuarioExecutorEmail?: string
  detalhes?: string
  ipAddress?: string
  userAgent?: string
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
    requireEmailVerification: true,
    // Sem isso, requireEmailVerification só bloqueia um NOVO login — a sessão
    // criada no próprio cadastro continuava valendo pra quem nunca verificou.
    autoSignIn: false,
    resetPasswordTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      // `url` já é o link de verificação do better-auth
      // (/reset-password/:token?callbackURL=...) — ele confere o token e
      // redireciona pra a página de destino (ver `redirectTo` em
      // authClient.requestPasswordReset, em esqueci-a-senha/page.tsx) com
      // ?token=... anexado. Não precisa (e não deve) ser reescrito aqui.
      const resetUrl = url

      await logUsuario({
        acao: `Solicitação de redefinição de senha - ${user.name} (${user.email})`,
        usuarioAfetadoId: user.id,
        usuarioAfetadoEmail: user.email,
        detalhes: 'Usuário solicitou redefinição de senha via formulário',
      })

      sendEmail({
        to: user.email,
        subject: 'Redefinição de Senha - Projeto Saas',
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
        subject: 'Senha Alterada - Projeto Saas',
        html: `<p>Olá ${user.name},</p><p>Sua senha foi alterada com sucesso em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' })}.</p><p>Se você não realizou esta alteração, entre em contato conosco imediatamente.</p>`,
        text: `Sua senha foi alterada com sucesso em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' })}.`,
      })
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await logUsuario({
        acao: `E-mail de verificação enviado - ${user.name} (${user.email})`,
        usuarioAfetadoId: user.id,
        usuarioAfetadoEmail: user.email,
        detalhes: 'Cadastro exige confirmação de e-mail antes do primeiro acesso',
      })

      sendEmail({
        to: user.email,
        subject: 'Confirme seu e-mail - Projeto Saas',
        html: verifyEmailTemplate({
          userName: user.name,
          verificationUrl: url,
        }),
        text: verifyEmailTextTemplate({
          userName: user.name,
          verificationUrl: url,
        }),
      })
    },
    afterEmailVerification: async (user) => {
      await logUsuario({
        acao: `E-mail verificado com sucesso - ${user.name} (${user.email})`,
        usuarioAfetadoId: user.id,
        usuarioAfetadoEmail: user.email,
        detalhes: 'Usuário confirmou o e-mail e liberou o acesso à conta',
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

  user: {
    deleteUser: {
      enabled: true,
      afterDelete: async (user) => {
        // Todas as tabelas do usuário (despesas, receitas, parcelamentos etc.)
        // já usam onDelete: 'cascade' pro user.id — apagar a conta já apaga
        // o resto. Aqui só registra que aconteceu.
        await logUsuario({
          acao: `Conta excluída - ${user.name} (${user.email})`,
          usuarioAfetadoId: user.id,
          usuarioAfetadoEmail: user.email,
          detalhes: 'Usuário excluiu a própria conta e todos os dados vinculados',
        })
      },
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
