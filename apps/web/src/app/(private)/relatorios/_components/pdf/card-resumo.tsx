import { Text, View } from '@react-pdf/renderer'

import { styles } from './styles'

interface CardResumoProps {
  label: string
  valor: string
  negativo?: boolean
}

const CardResumo = ({ label, valor, negativo }: CardResumoProps) => (
  <View style={styles.cardResumo}>
    <Text style={styles.cardResumoLabel}>{label}</Text>
    <Text
      style={[
        styles.cardResumoValor,
        negativo ? styles.cardResumoValorNegativo : undefined,
      ]}
    >
      {valor}
    </Text>
  </View>
)

export { CardResumo }
