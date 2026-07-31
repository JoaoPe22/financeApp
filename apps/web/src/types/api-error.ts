// Tipos usados por src/lib/error-handler.ts para normalizar erros de rede/HTTP
// em algo consistente para exibir nos toasts das telas.
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  statusCode: number
  error?: string
  details?: Record<string, unknown>

  constructor(response: ApiErrorResponse) {
    super(response.message)
    this.name = 'ApiError'
    this.statusCode = response.statusCode || 500
    this.error = response.error
    this.details = response.details
  }
}

export interface ErrorMessageConfig {
  400?: string;
  401?: string;
  403?: string;
  404?: string;
  409?: string;
  422?: string;
  429?: string;
  500?: string;
  502?: string;
  503?: string;
  504?: string;
  timeout?: string;
  network?: string;
  default?: string;
}
