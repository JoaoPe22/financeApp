import { and, eq } from 'drizzle-orm'

import { db } from '@/database'
import { contaBancaria } from '@/database/schema'
import type { FormaPagamento } from '@/database/schema/enums'

import { BadRequestError } from '../_errors/bad-request-error'

// A conta bancária só é gravada quando o pagamento é no crédito — nas demais
// formas ela é descartada, mesmo que o client mande alguma coisa.
const resolverContaBancaria = async (
  userId: string,
  formaPagamento: FormaPagamento | null | undefined,
  contaBancariaId: string | null | undefined,
) => {
  if (formaPagamento !== 'CREDITO') {
    return null
  }

  if (!contaBancariaId) {
    throw new BadRequestError('Informe a conta bancária do cartão de crédito')
  }

  const [contaExistente] = await db
    .select({ id: contaBancaria.id })
    .from(contaBancaria)
    .where(
      and(
        eq(contaBancaria.id, contaBancariaId),
        eq(contaBancaria.userId, userId),
      ),
    )
    .limit(1)

  if (!contaExistente) {
    throw new BadRequestError('Conta bancária inválida')
  }

  return contaBancariaId
}

export { resolverContaBancaria }
