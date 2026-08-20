import { StyleSheet } from '@react-pdf/renderer'

const cor = {
  primaria: '#16a34a',
  texto: '#1f2937',
  textoMuted: '#6b7280',
  borda: '#e5e7eb',
  fundoAlternado: '#f9fafb',
  fundoCabecalhoTabela: '#f3f4f6',
  destrutivo: '#dc2626',
}

const styles = StyleSheet.create({
  pagina: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 36,
    fontSize: 9,
    color: cor.texto,
    fontFamily: 'Helvetica',
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: cor.primaria,
    paddingBottom: 10,
    marginBottom: 16,
  },
  tituloRelatorio: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: cor.primaria,
  },
  subtituloRelatorio: {
    fontSize: 10,
    color: cor.textoMuted,
    marginTop: 2,
  },
  cabecalhoInfo: {
    alignItems: 'flex-end',
  },
  cabecalhoInfoTexto: {
    fontSize: 8,
    color: cor.textoMuted,
  },
  secao: {
    marginBottom: 16,
  },
  tituloSecao: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: cor.borda,
  },
  resumoLinha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  cardResumo: {
    flexGrow: 1,
    minWidth: 100,
    borderWidth: 1,
    borderColor: cor.borda,
    borderRadius: 4,
    padding: 8,
  },
  cardResumoLabel: {
    fontSize: 7.5,
    color: cor.textoMuted,
    marginBottom: 3,
  },
  cardResumoValor: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  cardResumoValorNegativo: {
    color: cor.destrutivo,
  },
  tabela: {
    borderWidth: 1,
    borderColor: cor.borda,
    borderRadius: 3,
  },
  linha: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: cor.borda,
    minHeight: 20,
    alignItems: 'center',
  },
  linhaCabecalho: {
    backgroundColor: cor.fundoCabecalhoTabela,
  },
  linhaAlternada: {
    backgroundColor: cor.fundoAlternado,
  },
  celulaCabecalho: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: cor.textoMuted,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  celula: {
    fontSize: 8.5,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  vazio: {
    fontSize: 8.5,
    color: cor.textoMuted,
    padding: 10,
    textAlign: 'center',
  },
  rodape: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    fontSize: 8,
    color: cor.textoMuted,
    textAlign: 'center',
  },
})

export { cor, styles }
