'use client'

import { AlertTriangle, Info, Lightbulb } from 'lucide-react'

import { Insight, TIPO_INSIGHT, TipoInsight } from '@/types/insight'

const ICONE_POR_TIPO: Record<TipoInsight, typeof AlertTriangle> = {
  [TIPO_INSIGHT.ALERTA]: AlertTriangle,
  [TIPO_INSIGHT.SUGESTAO]: Lightbulb,
  [TIPO_INSIGHT.INFO]: Info,
}

const ESTILO_POR_TIPO: Record<TipoInsight, string> = {
  [TIPO_INSIGHT.ALERTA]: 'border-destructive/30 text-destructive',
  [TIPO_INSIGHT.SUGESTAO]: 'border-amber-500/30 text-amber-600 dark:text-amber-400',
  [TIPO_INSIGHT.INFO]: 'border-border text-muted-foreground',
}

interface InsightListProps {
  insights: Insight[]
  vazio?: string
}

const InsightList = ({ insights, vazio }: InsightListProps) => {
  if (insights.length === 0) {
    return vazio ? <p className="text-muted-foreground text-sm">{vazio}</p> : null
  }

  return (
    <div className="space-y-2">
      {insights.map((insight) => {
        const Icone = ICONE_POR_TIPO[insight.tipo]

        return (
          <div
            key={insight.titulo}
            className={`flex gap-3 rounded-lg border p-3 text-sm ${ESTILO_POR_TIPO[insight.tipo]}`}
          >
            <Icone className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">{insight.titulo}</p>
              <p className="text-foreground/80 font-normal">{insight.descricao}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { InsightList }
