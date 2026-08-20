'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download, Loader2 } from 'lucide-react'
import { ReactElement } from 'react'

import { Button } from '@/components/ui/button'

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
