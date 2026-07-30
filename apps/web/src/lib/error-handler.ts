import { HTTPError, TimeoutError } from 'ky'

import {
  ApiError,
  ApiErrorResponse,
  ErrorMessageConfig,
} from '@/types/api-error'

const DEFAULT_ERROR_MESSAGES: Required<ErrorMessageConfig> = {
  400: 'Requisição inválida. Verifique os dados informados.',
  401: 'Sua sessão expirou. Faça login novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Este registro já existe no sistema.',
  422: 'Os dados enviados são inválidos. Verifique os campos.',
  429: 'Muitas requisições. Aguarde um momento e tente novamente.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
  502: 'Serviço temporariamente indisponível. Tente novamente.',
  503: 'Serviço em manutenção. Tente novamente em alguns minutos.',
  504: 'Tempo de resposta esgotado. Verifique sua conexão.',
  timeout:
    'A requisição demorou muito. Verifique sua conexão e tente novamente.',
  network: 'Erro de conexão. Verifique sua internet e tente novamente.',
  default: 'Ocorreu um erro inesperado. Tente novamente.',
}

export const extractErrorMessage = async (
  error: unknown,
  customMessages?: ErrorMessageConfig,
): Promise<string> => {
  const messages = { ...DEFAULT_ERROR_MESSAGES, ...customMessages }

  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof TimeoutError) {
    return messages.timeout
  }

  if (error instanceof HTTPError) {
    try {
      const errorBody = (await error.response.json()) as ApiErrorResponse

      if (errorBody.message) {
        return errorBody.message
      }

      const statusCode = error.response.status as keyof ErrorMessageConfig
      return messages[statusCode] || messages.default
    } catch {
      const statusCode = error.response.status as keyof ErrorMessageConfig
      return messages[statusCode] || messages.default
    }
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return messages.network
  }

  if (error instanceof Error) {
    const isNetworkError =
      error.message.includes('NetworkError') ||
      error.message.includes('Failed to fetch')

    if (isNetworkError) {
      return messages.network
    }

    return error.message || messages.default
  }

  return messages.default
}

export const handleApiError = async (error: unknown): Promise<ApiError> => {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof HTTPError) {
    try {
      const errorBody = (await error.response.json()) as ApiErrorResponse
      const statusCode = error.response.status as keyof ErrorMessageConfig
      const fallbackMessage =
        DEFAULT_ERROR_MESSAGES[statusCode] || DEFAULT_ERROR_MESSAGES.default

      return new ApiError({
        message: errorBody.message || fallbackMessage,
        statusCode: error.response.status,
        error: errorBody.error,
        details: errorBody.details,
      })
    } catch {
      const statusCode = error.response.status as keyof ErrorMessageConfig
      const fallbackMessage =
        DEFAULT_ERROR_MESSAGES[statusCode] || DEFAULT_ERROR_MESSAGES.default

      return new ApiError({
        message: fallbackMessage,
        statusCode: error.response.status,
      })
    }
  }

  if (error instanceof TimeoutError) {
    return new ApiError({
      message: DEFAULT_ERROR_MESSAGES.timeout,
      statusCode: 504,
      error: 'TIMEOUT',
    })
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new ApiError({
      message: DEFAULT_ERROR_MESSAGES.network,
      statusCode: 0,
      error: 'NETWORK_ERROR',
    })
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message || DEFAULT_ERROR_MESSAGES.default,
      statusCode: 500,
    })
  }

  return new ApiError({
    message: DEFAULT_ERROR_MESSAGES.default,
    statusCode: 500,
  })
}

export const shouldRetry = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    return [408, 429, 500, 502, 503, 504].includes(error.statusCode)
  }

  if (error instanceof HTTPError) {
    return [408, 429, 500, 502, 503, 504].includes(error.response.status)
  }

  if (error instanceof TimeoutError) {
    return true
  }

  return false
}
