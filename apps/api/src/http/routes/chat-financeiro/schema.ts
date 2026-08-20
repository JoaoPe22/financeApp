import { z } from 'zod'

const enviarMensagemBodySchema = z.object({
  mensagem: z.string().nonempty().max(2000),
})

export { enviarMensagemBodySchema }
