// Motor de insights: cada "Regra" olha o snapshot financeiro (resumo-financeiro.ts)
// e decide, sozinha, se tem algo relevante a dizer (retorna Insight) ou nada
// (retorna null). gerarInsights roda todas as regras e devolve só as que
// "dispararam" — pra adicionar um aviso novo, basta escrever mais uma Regra e
// listá-la em REGRAS, sem tocar no restante do arquivo.
import type { ResumoFinanceiro } from './resumo-financeiro'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

type TipoInsight = 'ALERTA' | 'SUGESTAO' | 'INFO'

type Insight = {
  tipo: TipoInsight
  titulo: string
  descricao: string
}

type Regra = (resumo: ResumoFinanceiro) => Insight | null

const regraMesSeguintePesado: Regra = (resumo) => {
  const { mesSeguinte, perfil, mesAtual } = resumo
  const totalFixoProximoMes =
    mesSeguinte.totalDespesasFixasAtivas +
    mesSeguinte.totalParcelasPendentesNoMes
  const baseline =
    perfil?.salarioFixo ?? mesAtual.planejamento?.salarioPrevisto ?? 0

  if (baseline <= 0 || totalFixoProximoMes <= baseline * 0.7) return null

  return {
    tipo: 'ALERTA',
    titulo: 'O mês que vem está pesado',
    descricao: `As contas fixas e parcelas já previstas para ${mesSeguinte.mes}/${mesSeguinte.ano} somam ${currencyFormatter.format(totalFixoProximoMes)}, mais de 70% da sua renda de referência (${currencyFormatter.format(baseline)}). Considere guardar uma sobra este mês para não apertar lá na frente.`,
  }
}

const regraSaldoNegativo: Regra = (resumo) => {
  const { mesAtual, despesasAvulsasPendentes } = resumo
  if (!mesAtual.planejamento || mesAtual.saldo >= 0) return null

  const maisBaratas = [...despesasAvulsasPendentes]
    .sort((a, b) => a.valor - b.valor)
    .slice(0, 3)

  const sugestaoCorte =
    maisBaratas.length > 0
      ? ` Despesas ainda pendentes que podem ser adiadas: ${maisBaratas.map((item) => `${item.descricao} (${currencyFormatter.format(item.valor)})`).join(', ')}.`
      : ''

  return {
    tipo: 'ALERTA',
    titulo: `Saldo negativo em ${mesAtual.mes}/${mesAtual.ano}`,
    descricao: `Este mês está fechando em ${currencyFormatter.format(mesAtual.saldo)}.${sugestaoCorte}`,
  }
}

const regraAntecipacaoParcelas: Regra = (resumo) => {
  const { mesAtual, parcelasPendentes } = resumo
  if (
    !mesAtual.planejamento ||
    mesAtual.saldo <= 0 ||
    parcelasPendentes.length === 0
  ) {
    return null
  }

  const lista = [...parcelasPendentes]
    .sort((a, b) => a.valor - b.valor)
    .slice(0, 3)
    .map(
      (item) =>
        `${item.descricao} (${currencyFormatter.format(item.valor)} restantes)`,
    )
    .join(', ')

  return {
    tipo: 'SUGESTAO',
    titulo: 'Dá para antecipar parcelas',
    descricao: `Você tem ${currencyFormatter.format(mesAtual.saldo)} de sobra este mês. Parcelamentos com saldo pendente: ${lista}. Considere antecipar para reduzir o total de parcelas futuras.`,
  }
}

const regraOportunidadeInvestimento: Regra = (resumo) => {
  const { mesAtual, reservas, investimentos } = resumo
  if (
    !mesAtual.planejamento ||
    mesAtual.saldo <= 0 ||
    reservas.length > 0 ||
    investimentos.length > 0
  ) {
    return null
  }

  return {
    tipo: 'SUGESTAO',
    titulo: 'Sobra do mês sem destino',
    descricao: `Com ${currencyFormatter.format(mesAtual.saldo)} de sobra e nenhuma reserva ou investimento cadastrado, considere começar por renda fixa de liquidez diária atrelada ao CDI antes de buscar opções de maior risco.`,
  }
}

const regraSemReservaEmergencia: Regra = (resumo) => {
  const { reservas, mesSeguinte, perfil } = resumo
  if (reservas.length > 0) return null

  const baseFixa = mesSeguinte.totalDespesasFixasAtivas
  const alvo = baseFixa > 0 ? baseFixa * 3 : (perfil?.salarioFixo ?? 0) * 3

  return {
    tipo: 'INFO',
    titulo: 'Sem reserva de emergência',
    descricao:
      alvo > 0
        ? `Você ainda não tem nenhuma reserva cadastrada. Uma meta comum é guardar de 3 a 6 vezes suas contas fixas mensais — no seu caso, algo em torno de ${currencyFormatter.format(alvo)}.`
        : 'Você ainda não tem nenhuma reserva cadastrada. Considere começar guardando um valor fixo por mês, mesmo que pequeno.',
  }
}

const REGRAS: Regra[] = [
  regraMesSeguintePesado,
  regraSaldoNegativo,
  regraAntecipacaoParcelas,
  regraOportunidadeInvestimento,
  regraSemReservaEmergencia,
]

const gerarInsights = (resumo: ResumoFinanceiro): Insight[] =>
  REGRAS.map((regra) => regra(resumo)).filter(
    (insight): insight is Insight => insight !== null,
  )

export { gerarInsights }
export type { Insight, TipoInsight }
