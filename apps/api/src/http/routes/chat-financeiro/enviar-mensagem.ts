import { GoogleGenAI } from '@google/genai'
import { asc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { db } from '@/database'
import { chatMensagem } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'
import { montarSystemPrompt } from '@/lib/chat-financeiro-prompt'
import { env } from '@/lib/env'
import { montarResumoFinanceiro } from '@/lib/resumo-financeiro'

import { BadRequestError } from '../_errors/bad-request-error'
import { enviarMensagemBodySchema } from './schema'

const MODELO_GEMINI = 'gemini-2.5-flash'
const LIMITE_HISTORICO = 20

const enviarMensagem = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/chat-financeiro/mensagens',
    {
      preHandler: authenticate,
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
      sse: true,
      schema: {
        tags: ['Chat Financeiro'],
        summary: 'Enviar mensagem ao chat financeiro',
        description:
          'Envia uma pergunta ao assistente de IA (Gemini) com o resumo financeiro do usuário como contexto, e transmite a resposta via SSE.',
        body: enviarMensagemBodySchema,
      },
    },
    async (request, reply) => {
      const { mensagem } = request.body
      const userId = request.user!.id

      if (!env.GEMINI_API_KEY) {
        throw new BadRequestError(
          'Chat com IA não está configurado. Defina GEMINI_API_KEY.',
        )
      }

      await db
        .insert(chatMensagem)
        .values({ userId, role: 'USER', conteudo: mensagem })

      const agora = new Date()
      const resumo = await montarResumoFinanceiro(
        userId,
        agora.getMonth() + 1,
        agora.getFullYear(),
      )

      const historico = await db
        .select({ role: chatMensagem.role, conteudo: chatMensagem.conteudo })
        .from(chatMensagem)
        .where(eq(chatMensagem.userId, userId))
        .orderBy(asc(chatMensagem.createdAt))
        .limit(LIMITE_HISTORICO)

      // A mensagem recém-inserida já está no fim do histórico acima — ela é o
      // "message" do sendMessageStream, então o histórico do chat é tudo antes dela.
      const historicoAnterior = historico.slice(0, -1)

      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
      const chat = ai.chats.create({
        model: MODELO_GEMINI,
        config: { systemInstruction: montarSystemPrompt(resumo) },
        history: historicoAnterior.map((item) => ({
          role: item.role === 'ASSISTANT' ? 'model' : 'user',
          parts: [{ text: item.conteudo }],
        })),
      })

      let respostaCompleta = ''

      try {
        const stream = await chat.sendMessageStream({ message: mensagem })

        for await (const chunk of stream) {
          const texto = chunk.text
          if (!texto) continue

          respostaCompleta += texto
          await reply.sse.send({ data: { delta: texto } })
        }

        await db.insert(chatMensagem).values({
          userId,
          role: 'ASSISTANT',
          conteudo: respostaCompleta || 'Não foi possível gerar uma resposta.',
        })

        await reply.sse.send({ data: { done: true } })
      } catch (error) {
        console.error(error)
        await reply.sse.send({
          data: { error: 'Erro ao consultar a IA. Tente novamente.' },
        })
      }
    },
  )
}

export { enviarMensagem }
