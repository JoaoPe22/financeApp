// Lance esse erro quando não há sessão válida (401) — usado pelo middleware de auth
export class UnauthorizedError extends Error {
  constructor(message?: string) {
    super(message ?? 'Unauthorized.')
  }
}
