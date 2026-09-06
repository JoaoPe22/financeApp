export const FORMA_PAGAMENTO = {
  DINHEIRO: 'DINHEIRO',
  PIX: 'PIX',
  DEBITO: 'DEBITO',
  CREDITO: 'CREDITO',
  BOLETO: 'BOLETO',
  OUTRO: 'OUTRO',
} as const

export type FormaPagamento =
  (typeof FORMA_PAGAMENTO)[keyof typeof FORMA_PAGAMENTO]

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'Pix',
  DEBITO: 'Débito',
  CREDITO: 'Cartão de crédito',
  BOLETO: 'Boleto',
  OUTRO: 'Outro',
}

export interface ContaBancaria {
  id: string
  banco: string
  agencia: string | null
  conta: string | null
  apelido: string | null
}

// Mesmo rótulo que a API monta em contaBancariaNome, reaproveitado nos selects
export const rotuloContaBancaria = (conta: ContaBancaria) =>
  conta.apelido ??
  (conta.agencia ? `${conta.banco} · Ag. ${conta.agencia}` : conta.banco)
