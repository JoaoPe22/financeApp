import { and, eq, lt, sql } from 'drizzle-orm'

import { db } from '@/database'
import {
  despesaMensal,
  parcela,
  parcelamento,
  planejamentoMensal,
} from '@/database/schema'

import { hoje } from './dayjs'

// O status ATRASADA existe no enum, é filtrado nas consultas e tem label na UI,
// mas nada nunca o definia — contas vencidas ficavam PENDENTE para sempre.
// ponytail: varredura na leitura (chamada por montarResumoFinanceiro, que todo
// caminho de leitura já executa) em vez de um cron. Ambos os UPDATEs são
// idempotentes. Migrar para cron/pg_cron se o volume de linhas por usuário crescer.
const marcarVencidos = async (userId: string) => {
  const dataDeHoje = hoje()

  await Promise.all([
    db
      .update(despesaMensal)
      .set({ status: 'ATRASADA' })
      .where(
        and(
          eq(despesaMensal.status, 'PENDENTE'),
          lt(despesaMensal.dataVencimento, dataDeHoje),
          sql`${despesaMensal.planejamentoMensalId} IN (
            SELECT ${planejamentoMensal.id} FROM ${planejamentoMensal}
            WHERE ${planejamentoMensal.userId} = ${userId}
          )`,
        ),
      ),
    db
      .update(parcela)
      .set({ status: 'ATRASADA' })
      .where(
        and(
          eq(parcela.status, 'PENDENTE'),
          lt(parcela.dataVencimento, dataDeHoje),
          sql`${parcela.parcelamentoId} IN (
            SELECT ${parcelamento.id} FROM ${parcelamento}
            WHERE ${parcelamento.userId} = ${userId}
          )`,
        ),
      ),
  ])
}

export { marcarVencidos }
