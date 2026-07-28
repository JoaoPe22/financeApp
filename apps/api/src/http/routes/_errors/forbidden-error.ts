class ForbiddenError extends Error {
  constructor(message?: string) {
    super(message ?? 'Forbidden.')
  }
}

export { ForbiddenError }
