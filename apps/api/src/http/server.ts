import Fastify from 'fastify'

import { env } from '@/lib/env'

const app = Fastify({
  logger: true,
})


app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log(`Server está rodando no host http://0.0.0.0:${env.PORT}`)
})

export { app }
