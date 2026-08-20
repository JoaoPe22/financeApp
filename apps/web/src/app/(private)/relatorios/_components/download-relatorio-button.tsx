'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download, Loader2 } from 'lucide-react'
import { ReactElement } from 'react'

import { Button } from '@/components/ui/button'

// PDFDownloadLink já começa a montar o PDF (via WASM, ver comentário em
// pdf/tabela.tsx) assim que este componente monta, não só quando o usuário
// clica — por isso o CSP do app (next.config.ts) precisa liberar
// 'wasm-unsafe-eval' em script-src, senão a geração trava em silêncio e o
// clique não baixa nada.
interface DownloadRelatorioButtonProps {
  document: ReactElement
  fileName: string
}

const DownloadRelatorioButton = ({
  document,
  fileName,
}: DownloadRelatorioButtonProps) => (
  <PDFDownloadLink document={document} fileName={fileName}>
    {({ loading }) => (
      <Button type="button" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Download />}
        Baixar PDF
      </Button>
    )}
  </PDFDownloadLink>
)

export { DownloadRelatorioButton }
