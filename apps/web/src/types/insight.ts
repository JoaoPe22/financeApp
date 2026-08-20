export const TIPO_INSIGHT = {
  ALERTA: 'ALERTA',
  SUGESTAO: 'SUGESTAO',
  INFO: 'INFO',
} as const

export type TipoInsight = (typeof TIPO_INSIGHT)[keyof typeof TIPO_INSIGHT]

export interface Insight {
  tipo: TipoInsight
  titulo: string
  descricao: string
}
