import { Text, View } from '@react-pdf/renderer'

import { formatDateTimeShort } from '@/lib/dayjs'

import { styles } from './styles'

interface CabecalhoRelatorioProps {
  titulo: string
  subtitulo?: string
  nomeUsuario?: string | null
}

const CabecalhoRelatorio = ({
  titulo,
  subtitulo,
  nomeUsuario,
}: CabecalhoRelatorioProps) => (
  <View style={styles.cabecalho} fixed>
    <View>
      <Text style={styles.tituloRelatorio}>{titulo}</Text>
      {subtitulo && <Text style={styles.subtituloRelatorio}>{subtitulo}</Text>}
    </View>
    <View style={styles.cabecalhoInfo}>
      {nomeUsuario && (
        <Text style={styles.cabecalhoInfoTexto}>{nomeUsuario}</Text>
      )}
      <Text style={styles.cabecalhoInfoTexto}>
        Gerado em {formatDateTimeShort(new Date())}
      </Text>
    </View>
  </View>
)

const RodapeRelatorio = () => (
  <Text
    style={styles.rodape}
    fixed
    render={({ pageNumber, totalPages }) =>
      `Página ${pageNumber} de ${totalPages}`
    }
  />
)

export { CabecalhoRelatorio, RodapeRelatorio }
