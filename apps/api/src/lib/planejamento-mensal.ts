import { and, eq } from 'drizzle-orm'

import { db } from '@/database'
import { perfil, planejamentoMensal } from '@/database/schema'

// Aceita tanto `db` quanto uma transação (`tx`) — ambos implementam a mesma
// interface de query builder usada aqui.
type DbOuTx = Pick<typeof db, 'select' | 'insert'>

// Garante que o planejamento_mensal de um mês exista (sem puxar despesas
// fixas — isso é feito por /planejamentos-mensais/abrir). Usado tanto pela
// abertura manual do mês quanto pela geração de parcelas, que precisa de um
// planejamentoMensalId válido para cada mês em que uma parcela cai.
const encontrarOuCriarPlanejamentoMensal = async (
  tx: DbOuTx,
  userId: string,
  mes: number,
  ano: number,
) => {
  const [existente] = await tx
    .select({ id: planejamentoMensal.id })
    .from(planejamentoMensal)
    .where(
      and(
        eq(planejamentoMensal.userId, userId),
        eq(planejamentoMensal.mes, mes),
        eq(planejamentoMensal.ano, ano),
      ),
    )
    .limit(1)

  if (existente) {
    return existente.id
  }

  const [perfilUsuario] = await tx
    .select({ salarioFixo: perfil.salarioFixo })
    .from(perfil)
    .where(eq(perfil.userId, userId))
    .limit(1)

  const [novoPlanejamento] = await tx
    .insert(planejamentoMensal)
    .values({
      userId,
      mes,
      ano,
      salarioPrevisto: perfilUsuario?.salarioFixo ?? null,
    })
    .returning({ id: planejamentoMensal.id })

  return novoPlanejamento.id
}

export { encontrarOuCriarPlanejamentoMensal }
