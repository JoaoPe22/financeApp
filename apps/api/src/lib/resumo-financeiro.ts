import { and, eq, inArray } from 'drizzle-orm'

import { db } from '@/database'
import {
  despesaFixa,
  despesaMensal,
  investimento,
  objetivo,
  parcela,
  parcelamento,
  perfil,
  planejamentoMensal,
  receita,
  reserva,
} from '@/database/schema'

type DadosMes = {
  planejamento: {
    id: string
    salarioPrevisto: number | null
    salarioRecebido: number | null
  } | null
  totalDespesas: number
  totalReceitas: number
  totalParcelas: number
  saldo: number
}

type ResumoFinanceiro = {
  perfil: { salarioFixo: number | null } | null
  mesAtual: DadosMes & { mes: number, ano: number }
  mesSeguinte: {
    mes: number
    ano: number
    totalDespesasFixasAtivas: number
    totalParcelasPendentesNoMes: number
  }
  despesasFixasAtivas: { id: string, descricao: string, valor: number, diaVencimento: number }[]
  despesasAvulsasPendentes: { descricao: string, valor: number }[]
  parcelasPendentes: { parcelamentoId: string, descricao: string, valor: number }[]
  objetivosAtivos: { id: string, titulo: string, valorMeta: number, valorAtual: number, prazo: string }[]
  reservas: { id: string, instituicao: string, valor: number, rentabilidade: number }[]
  investimentos: { id: string, descricao: string, valorAplicado: number, rentabilidade: number, liquidez: string }[]
}

const somar = (valores: string[]) =>
  valores.reduce((soma, valor) => soma + Number(valor), 0)

const buscarDadosMes = async (
  userId: string,
  mes: number,
  ano: number,
): Promise<DadosMes> => {
  const [planejamentoDoMes] = await db
    .select()
    .from(planejamentoMensal)
    .where(
      and(
        eq(planejamentoMensal.userId, userId),
        eq(planejamentoMensal.mes, mes),
        eq(planejamentoMensal.ano, ano),
      ),
    )
    .limit(1)

  if (!planejamentoDoMes) {
    return {
      planejamento: null,
      totalDespesas: 0,
      totalReceitas: 0,
      totalParcelas: 0,
      saldo: 0,
    }
  }

  const [despesas, receitas, parcelas] = await Promise.all([
    db
      .select({ valor: despesaMensal.valor })
      .from(despesaMensal)
      .where(eq(despesaMensal.planejamentoMensalId, planejamentoDoMes.id)),
    db
      .select({ valorLiquido: receita.valorLiquido })
      .from(receita)
      .where(eq(receita.planejamentoMensalId, planejamentoDoMes.id)),
    db
      .select({ valor: parcela.valor })
      .from(parcela)
      .where(eq(parcela.planejamentoMensalId, planejamentoDoMes.id)),
  ])

  const totalDespesas = somar(despesas.map((d) => d.valor))
  const totalReceitas = somar(receitas.map((r) => r.valorLiquido))
  const totalParcelas = somar(parcelas.map((p) => p.valor))
  const salarioBase = planejamentoDoMes.salarioRecebido ?? planejamentoDoMes.salarioPrevisto

  return {
    planejamento: {
      id: planejamentoDoMes.id,
      salarioPrevisto: planejamentoDoMes.salarioPrevisto
        ? Number(planejamentoDoMes.salarioPrevisto)
        : null,
      salarioRecebido: planejamentoDoMes.salarioRecebido
        ? Number(planejamentoDoMes.salarioRecebido)
        : null,
    },
    totalDespesas,
    totalReceitas,
    totalParcelas,
    saldo: Number(salarioBase ?? 0) + totalReceitas - totalDespesas - totalParcelas,
  }
}

// Reúne os dados financeiros do usuário num único snapshot — usado tanto
// pelo motor de insights quanto pelo chat com IA, pra não duplicar as
// mesmas consultas nos dois lugares.
const montarResumoFinanceiro = async (
  userId: string,
  mes: number,
  ano: number,
): Promise<ResumoFinanceiro> => {
  const proximoMes = mes === 12 ? 1 : mes + 1
  const proximoAno = mes === 12 ? ano + 1 : ano

  const [
    perfilUsuario,
    mesAtual,
    dadosProximoMes,
    despesasFixasAtivas,
    parcelasPendentesRaw,
    objetivosAtivos,
    reservas,
    investimentos,
  ] = await Promise.all([
    db
      .select({ salarioFixo: perfil.salarioFixo })
      .from(perfil)
      .where(eq(perfil.userId, userId))
      .limit(1)
      .then((rows) => rows[0]),
    buscarDadosMes(userId, mes, ano),
    buscarDadosMes(userId, proximoMes, proximoAno),
    db
      .select({
        id: despesaFixa.id,
        descricao: despesaFixa.descricao,
        valor: despesaFixa.valor,
        diaVencimento: despesaFixa.diaVencimento,
      })
      .from(despesaFixa)
      .where(and(eq(despesaFixa.userId, userId), eq(despesaFixa.ativa, true))),
    db
      .select({
        parcelamentoId: parcelamento.id,
        descricao: parcelamento.descricao,
        valor: parcela.valor,
      })
      .from(parcela)
      .innerJoin(parcelamento, eq(parcelamento.id, parcela.parcelamentoId))
      .where(and(eq(parcelamento.userId, userId), eq(parcela.status, 'PENDENTE'))),
    db
      .select({
        id: objetivo.id,
        titulo: objetivo.titulo,
        valorMeta: objetivo.valorMeta,
        valorAtual: objetivo.valorAtual,
        prazo: objetivo.prazo,
      })
      .from(objetivo)
      .where(and(eq(objetivo.userId, userId), eq(objetivo.status, 'ATIVO'))),
    db
      .select({
        id: reserva.id,
        instituicao: reserva.instituicao,
        valor: reserva.valor,
        rentabilidade: reserva.rentabilidade,
      })
      .from(reserva)
      .where(eq(reserva.userId, userId)),
    db
      .select({
        id: investimento.id,
        descricao: investimento.descricao,
        valorAplicado: investimento.valorAplicado,
        rentabilidade: investimento.rentabilidade,
        liquidez: investimento.liquidez,
      })
      .from(investimento)
      .where(eq(investimento.userId, userId)),
  ])

  const parcelasPorParcelamento = new Map<string, { descricao: string, total: number }>()
  for (const item of parcelasPendentesRaw) {
    const acumulado = parcelasPorParcelamento.get(item.parcelamentoId)
    parcelasPorParcelamento.set(item.parcelamentoId, {
      descricao: item.descricao,
      total: (acumulado?.total ?? 0) + Number(item.valor),
    })
  }

  const despesasAvulsasPendentes = mesAtual.planejamento
    ? await db
      .select({ descricao: despesaMensal.descricao, valor: despesaMensal.valor })
      .from(despesaMensal)
      .where(
        and(
          eq(despesaMensal.planejamentoMensalId, mesAtual.planejamento.id),
          inArray(despesaMensal.status, ['PENDENTE', 'ATRASADA']),
        ),
      )
    : []

  return {
    perfil: perfilUsuario
      ? { salarioFixo: perfilUsuario.salarioFixo ? Number(perfilUsuario.salarioFixo) : null }
      : null,
    mesAtual: { ...mesAtual, mes, ano },
    mesSeguinte: {
      mes: proximoMes,
      ano: proximoAno,
      totalDespesasFixasAtivas: somar(despesasFixasAtivas.map((d) => d.valor)),
      totalParcelasPendentesNoMes: dadosProximoMes.totalParcelas,
    },
    despesasFixasAtivas: despesasFixasAtivas.map((item) => ({
      ...item,
      valor: Number(item.valor),
    })),
    despesasAvulsasPendentes: despesasAvulsasPendentes
      .filter((item) => item.descricao)
      .map((item) => ({ descricao: item.descricao, valor: Number(item.valor) })),
    parcelasPendentes: Array.from(parcelasPorParcelamento.entries()).map(
      ([parcelamentoId, item]) => ({
        parcelamentoId,
        descricao: item.descricao,
        valor: item.total,
      }),
    ),
    objetivosAtivos: objetivosAtivos.map((item) => ({
      ...item,
      valorMeta: Number(item.valorMeta),
      valorAtual: Number(item.valorAtual),
    })),
    reservas: reservas.map((item) => ({
      ...item,
      valor: Number(item.valor),
      rentabilidade: Number(item.rentabilidade),
    })),
    investimentos: investimentos.map((item) => ({
      ...item,
      valorAplicado: Number(item.valorAplicado),
      rentabilidade: Number(item.rentabilidade),
    })),
  }
}

export { buscarDadosMes, montarResumoFinanceiro }
export type { DadosMes, ResumoFinanceiro }
