import { z } from 'zod'

const enviarMensagemBodySchema = z.object({
  mensagem: z.string().nonempty().max(2000),
})

const mensagemResponseSchema = z.object({
  id: z.uuid(),
  role: z.enum(['USER', 'ASSISTANT']),
  conteudo: z.string(),
  createdAt: z.date(),
})

export { enviarMensagemBodySchema, mensagemResponseSchema }
