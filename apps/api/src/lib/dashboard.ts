import { and, desc, eq, inArray, lte, sql } from 'drizzle-orm'

import { db } from '@/database'
import {
  categoria,
  despesaMensal,
  parcela,
  parcelamento,
  planejamentoMensal,
} from '@/database/schema'

import { agora, dayjs } from './dayjs'
import { gerarInsights, type Insight } from './regras-insights'
import { buscarDadosMes, montarResumoFinanceiro } from './resumo-financeiro'

const MESES_DE_HISTORICO = 6
const DIAS_LEMBRETE = 7

type PontoHistoricoSaldo = { mes: number; ano: number; saldo: number }
type GastoPorCategoria = {
  categoriaNome: string
  categoriaCor: string
  valor: number
}
type ParcelamentoResumo = {
  descricao: string
  totalPago: number
  totalPendente: number
}
type DespesaPesada = { descricao: string; categoriaNome: string; valor: number }
type Lembrete = {
  descricao: string
  valor: number
  dataVencimento: string
  tipo: 'DESPESA' | 'PARCELA'
}

type Dashboard = {
  historicoSaldo: PontoHistoricoSaldo[]
  gastosPorCategoria: GastoPorCategoria[]
  parcelamentos: ParcelamentoResumo[]
  metaReserva: { totalReservado: number; meta: number } | null
  despesasPesadas: DespesaPesada[]
  receitaVsDespesa: {
    totalReceitas: number
    totalDespesas: number
    salario: number
  }
  lembretes: Lembrete[]
  avisos: Insight[]
}

const buscarHistoricoSaldo = async (
  userId: string,
  mes: number,
  ano: number,
): Promise<PontoHistoricoSaldo[]> => {
  const referencia = dayjs(`${ano}-${String(mes).padStart(2, '0')}-01`)

  const meses = Array.from({ length: MESES_DE_HISTORICO }, (_, indice) =>
    referencia.subtract(MESES_DE_HISTORICO - 1 - indice, 'month'),
  )

  const dados = await Promise.all(
    meses.map((data) => buscarDadosMes(userId, data.month() + 1, data.year())),
  )

  return dados.map((item, indice) => ({
    mes: meses[indice].month() + 1,
    ano: meses[indice].year(),
    saldo: item.saldo,
  }))
}

// Orquestra tudo que a tela de dashboard precisa num único payload: reaproveita
// o snapshot de montarResumoFinanceiro (mesmo usado pelos insights e pelo chat)
// e dispara em paralelo as consultas exclusivas do dashboard (histórico de 6
// meses, gasto por categoria, maiores despesas, progresso dos parcelamentos e
// lembretes de vencimento). Cada query "opcional" (que depende de já existir
// planejamento do mês) usa planejamentoId ? query : Promise.resolve([]) pra
// poder entrar no mesmo Promise.all sem quebrar quando o mês ainda não foi aberto.
const montarDashboard = async (
  userId: string,
  mesReferencia?: number,
  anoReferencia?: number,
): Promise<Dashboard> => {
  const referenciaAtual = agora()
  const mes = mesReferencia ?? referenciaAtual.month() + 1
  const ano = anoReferencia ?? referenciaAtual.year()

  const resumo = await montarResumoFinanceiro(userId, mes, ano)
  const avisos = gerarInsights(resumo)
  const planejamentoId = resumo.mesAtual.planejamento?.id ?? null

  const limiteLembrete = referenciaAtual
    .add(DIAS_LEMBRETE, 'day')
    .format('YYYY-MM-DD')

  const [
    historicoSaldo,
    gastosPorCategoriaRaw,
    despesasPesadasRaw,
    todasParcelas,
    despesasProximas,
    parcelasProximas,
  ] = await Promise.all([
    buscarHistoricoSaldo(userId, mes, ano),
    planejamentoId
      ? db
        .select({
          categoriaNome: categoria.nome,
          categoriaCor: categoria.cor,
          valor: sql<string>`sum(${despesaMensal.valor})`,
        })
        .from(despesaMensal)
        .innerJoin(categoria, eq(categoria.id, despesaMensal.categoriaId))
        .where(eq(despesaMensal.planejamentoMensalId, planejamentoId))
        .groupBy(categoria.id, categoria.nome, categoria.cor)
      : Promise.resolve([]),
    planejamentoId
      ? db
        .select({
          descricao: despesaMensal.descricao,
          categoriaNome: categoria.nome,
          valor: despesaMensal.valor,
        })
        .from(despesaMensal)
        .innerJoin(categoria, eq(categoria.id, despesaMensal.categoriaId))
        .where(eq(despesaMensal.planejamentoMensalId, planejamentoId))
        .orderBy(desc(despesaMensal.valor))
        .limit(5)
      : Promise.resolve([]),
    db
      .select({
        parcelamentoId: parcela.parcelamentoId,
        descricao: parcelamento.descricao,
        valor: parcela.valor,
        status: parcela.status,
      })
      .from(parcela)
      .innerJoin(parcelamento, eq(parcelamento.id, parcela.parcelamentoId))
      .where(eq(parcelamento.userId, userId)),
    db
      .select({
        descricao: despesaMensal.descricao,
        valor: despesaMensal.valor,
        dataVencimento: despesaMensal.dataVencimento,
      })
      .from(despesaMensal)
      .innerJoin(
        planejamentoMensal,
        eq(planejamentoMensal.id, despesaMensal.planejamentoMensalId),
      )
      .where(
        and(
          eq(planejamentoMensal.userId, userId),
          inArray(despesaMensal.status, ['PENDENTE', 'ATRASADA']),
          // Sem piso de data: uma conta já vencida é o lembrete mais urgente
          lte(despesaMensal.dataVencimento, limiteLembrete),
        ),
      ),
    db
      .select({
        descricao: parcelamento.descricao,
        valor: parcela.valor,
        dataVencimento: parcela.dataVencimento,
      })
      .from(parcela)
      .innerJoin(parcelamento, eq(parcelamento.id, parcela.parcelamentoId))
      .where(
        and(
          eq(parcelamento.userId, userId),
          inArray(parcela.status, ['PENDENTE', 'ATRASADA']),
          lte(parcela.dataVencimento, limiteLembrete),
        ),
      ),
  ])

  const parcelamentosPorId = new Map<string, ParcelamentoResumo>()
  for (const item of todasParcelas) {
    const acumulado = parcelamentosPorId.get(item.parcelamentoId) ?? {
      descricao: item.descricao,
      totalPago: 0,
      totalPendente: 0,
    }
    const valor = Number(item.valor)

    if (item.status === 'PAGA') {
      acumulado.totalPago += valor
    } else {
      acumulado.totalPendente += valor
    }

    parcelamentosPorId.set(item.parcelamentoId, acumulado)
  }

  const totalReservado = resumo.reservas.reduce(
    (soma, item) => soma + item.valor,
    0,
  )
  const metaValor =
    resumo.mesSeguinte.totalDespesasFixasAtivas > 0
      ? resumo.mesSeguinte.totalDespesasFixasAtivas * 3
      : (resumo.perfil?.salarioFixo ?? 0) * 3

  const lembretes: Lembrete[] = [
    ...despesasProximas.map((item) => ({
      descricao: item.descricao,
      valor: Number(item.valor),
      dataVencimento: item.dataVencimento,
      tipo: 'DESPESA' as const,
    })),
    ...parcelasProximas.map((item) => ({
      descricao: item.descricao,
      valor: Number(item.valor),
      dataVencimento: item.dataVencimento,
      tipo: 'PARCELA' as const,
    })),
  ].sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento))

  return {
    historicoSaldo,
    gastosPorCategoria: gastosPorCategoriaRaw.map((item) => ({
      ...item,
      valor: Number(item.valor),
    })),
    parcelamentos: Array.from(parcelamentosPorId.values()),
    metaReserva: metaValor > 0 ? { totalReservado, meta: metaValor } : null,
    despesasPesadas: despesasPesadasRaw.map((item) => ({
      ...item,
      valor: Number(item.valor),
    })),
    receitaVsDespesa: {
      totalReceitas: resumo.mesAtual.totalReceitas,
      totalDespesas:
        resumo.mesAtual.totalDespesas + resumo.mesAtual.totalParcelas,
      salario:
        resumo.mesAtual.planejamento?.salarioRecebido ??
        resumo.mesAtual.planejamento?.salarioPrevisto ??
        0,
    },
    lembretes,
    avisos,
  }
}

export { montarDashboard }
export type { Dashboard }
