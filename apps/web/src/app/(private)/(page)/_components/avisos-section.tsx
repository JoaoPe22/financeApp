'use client'

import { InsightList } from '@/components/insight-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Insight } from '@/types/insight'

interface AvisosSectionProps {
  avisos: Insight[]
}

const AvisosSection = ({ avisos }: AvisosSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Avisos de atenção</CardTitle>
      </CardHeader>
      <CardContent>
        <InsightList
          insights={avisos}
          vazio="Nada chamando atenção por enquanto."
        />
      </CardContent>
    </Card>
  )
}

export { AvisosSection }
