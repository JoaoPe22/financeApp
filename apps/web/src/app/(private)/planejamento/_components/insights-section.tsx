'use client'

import { InsightList } from '@/components/insight-list'
import { useInsightsMensais } from '@/hooks/use-insights-mensais'

interface InsightsSectionProps {
  mes: number
  ano: number
}

// Sugestões calculadas ao vivo (sem IA, sem persistência) — apoio à decisão,
// não é o fator principal do planejamento.
const InsightsSection = ({ mes, ano }: InsightsSectionProps) => {
  const { data, isLoading } = useInsightsMensais(mes, ano)

  if (isLoading) return null

  return <InsightList insights={data?.insights ?? []} />
}

export { InsightsSection }
