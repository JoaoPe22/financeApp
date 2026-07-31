// Lance esse erro quando o usuário está autenticado mas não tem permissão para a ação (403)
class ForbiddenError extends Error {
  constructor(message?: string) {
    super(message ?? 'Forbidden.')
  }
}

export { ForbiddenError }
