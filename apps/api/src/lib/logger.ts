import type { FastifyServerOptions } from 'fastify'

// Rótulo e cor (ANSI) de cada nível de log padrão do pino
const PINO_LEVELS: Record<number, { label: string; color: number }> = {
  10: { label: 'TRACE', color: 90 },
  20: { label: 'DEBUG', color: 34 },
  30: { label: 'INFO', color: 32 },
  40: { label: 'WARN', color: 33 },
  50: { label: 'ERROR', color: 31 },
  60: { label: 'FATAL', color: 35 },
}

// Formata uma linha de log genérica do pino (level, time, msg, err) para leitura em dev,
// sem depender do pino-pretty (evita empacotar seus requires nativos no build de produção)
const prettifyLog = (log: Record<string, unknown>) => {
  const { label, color } = PINO_LEVELS[log.level as number] ?? PINO_LEVELS[30]
  const time = new Date(log.time as number).toLocaleTimeString('pt-BR')
  const msg = typeof log.msg === 'string' ? log.msg : ''

  let line = `[${time}] \x1b[${color}m${label}\x1b[0m: ${msg}\n`

  const err = log.err as { stack?: string } | undefined
  if (err?.stack) line += `${err.stack}\n`

  return line
}

// Monta a configuração de logger do Fastify: JSON estruturado em produção,
// e uma linha por requisição (formato morgan "dev") fora de produção
const getLoggerConfig = (): {
  logger: FastifyServerOptions['logger']
  disableRequestLogging: boolean
} => {
  if (process.env.NODE_ENV === 'production') {
    return {
      logger: {
        level: 'info',
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
            headers: req.headers,
            hostname: req.hostname,
            remoteAddress: req.ip,
            remotePort: req.socket.remotePort,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      },
      disableRequestLogging: false,
    }
  }

  return {
    logger: {
      level: 'info',
      stream: {
        write(chunk: string) {
          const log = JSON.parse(chunk)
          const req = log.req as { method: string; url: string } | undefined
          const res = log.res as { statusCode: number } | undefined

          if (!req || !res) {
            process.stdout.write(prettifyLog(log))
            return
          }

          const status = res.statusCode
          const color =
            status >= 500 ? 31 : status >= 400 ? 33 : status >= 300 ? 36 : 32
          const time =
            typeof log.responseTime === 'number' ? log.responseTime.toFixed(3) : '?'
          const length = log.contentLength ?? '-'

          process.stdout.write(
            `${req.method} ${req.url} \x1b[${color}m${status}\x1b[0m ${time} ms - ${length}\n`,
          )
        },
      },
    },
    disableRequestLogging: true,
  }
}

export { getLoggerConfig }
