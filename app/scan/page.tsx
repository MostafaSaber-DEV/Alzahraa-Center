'use client'

import { Suspense } from 'react'
import QRScannerContent from './scanner-content'

export default function QRScanPage() {
  return (
    <Suspense fallback={<div>Loading scanner...</div>}>
      <QRScannerContent />
    </Suspense>
  )
}
