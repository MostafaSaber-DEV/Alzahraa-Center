'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Topbar } from '@/components/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Camera, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

type StatusType = 'idle' | 'scanning' | 'success' | 'error' | 'warning' | 'loading'

interface StatusMessage {
  type: StatusType
  message: string
}

const StatusMessage = ({ status }: { status: StatusMessage }) => {
  const getStatusConfig = (type: StatusType) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          className: 'border-green-200 bg-green-50 text-green-800',
          iconClassName: 'text-green-600',
        }
      case 'error':
        return {
          icon: XCircle,
          className: 'border-red-200 bg-red-50 text-red-800',
          iconClassName: 'text-red-600',
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          className: 'border-yellow-200 bg-yellow-50 text-yellow-800',
          iconClassName: 'text-yellow-600',
        }
      case 'loading':
        return {
          icon: Loader2,
          className: 'border-blue-200 bg-blue-50 text-blue-800',
          iconClassName: 'text-blue-600 animate-spin',
        }
      default:
        return null
    }
  }

  const config = getStatusConfig(status.type)
  if (!config) return null

  const Icon = config.icon

  return (
    <Alert className={`mb-6 ${config.className}`}>
      <Icon className={`h-4 w-4 ${config.iconClassName}`} />
      <AlertDescription className="font-medium">{status.message}</AlertDescription>
    </Alert>
  )
}

export default function QRScanPage() {
  const [status, setStatus] = useState<StatusMessage>({ type: 'idle', message: '' })
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerElementId = 'qr-reader'

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.log('Error clearing scanner:', error)
        })
      }
      setIsScanning(false)

      if (!decodedText || decodedText.trim().length === 0) {
        setStatus({
          type: 'warning',
          message: 'Invalid QR code. Please check and rescan.',
        })
        return
      }

      setStatus({
        type: 'loading',
        message: 'Processing scan result...',
      })

      try {
        const response = await fetch(
          'https://primary-production-6fc94.up.railway.app/webhook-test/scan-qr',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              qr_data: decodedText,
              timestamp: new Date().toISOString(),
            }),
          }
        )

        if (response.ok) {
          setStatus({
            type: 'success',
            message: 'Scan successful. Processing data...',
          })

          setTimeout(() => {
            if (scannerRef.current) {
              scannerRef.current.clear().catch(() => {})
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
            initializeScanner()
          }, 3000)
        } else {
          throw new Error('Failed to process scan')
        }
      } catch (error) {
        setStatus({
          type: 'error',
          message: 'Scan failed. Please try again.',
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [setIsScanning, setStatus]
  )

  const initializeScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((error) => {
        console.log('Error clearing scanner:', error)
      })
    }

    scannerRef.current = new Html5QrcodeScanner(
      scannerElementId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    )

    scannerRef.current.render(
      (decodedText) => {
        handleScanSuccess(decodedText)
      },
      (error) => {
        if (error.includes('NotAllowedError') || error.includes('NotFoundError')) {
          setCameraError(true)
          setStatus({
            type: 'error',
            message: 'Camera not found. Please allow access or check your camera.',
          })
        }
      }
    )

    setIsScanning(true)
    setCameraError(false)
    setStatus({ type: 'scanning', message: 'Point your camera at a QR code to scan' })
  }, [handleScanSuccess, setIsScanning, setCameraError, setStatus])

  const handleRescan = () => {
    setStatus({ type: 'idle', message: '' })
    initializeScanner()
  }

  useEffect(() => {
    initializeScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.log('Error clearing scanner:', error)
        })
      }
    }
  }, [initializeScanner])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Topbar />

      <div className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">QR Code Scanner</h1>
            <p className="mt-2 text-gray-600">Scan QR codes to process attendance or data</p>
          </div>

          {status.type !== 'idle' && <StatusMessage status={status} />}

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Camera className="h-5 w-5" />
                Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {cameraError ? (
                <div className="py-12 text-center">
                  <Camera className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">Camera Access Required</h3>
                  <p className="mb-6 text-gray-600">
                    Please allow camera access to scan QR codes, or check if your camera is working
                    properly.
                  </p>
                  <Button onClick={handleRescan} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    id={scannerElementId}
                    className="mx-auto max-w-sm overflow-hidden rounded-lg"
                  />

                  {isScanning && (
                    <div className="space-y-4 text-center">
                      <p className="text-sm text-gray-600">
                        Position the QR code within the frame to scan
                      </p>
                      <Button variant="outline" onClick={handleRescan} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Restart Scanner
                      </Button>
                    </div>
                  )}

                  {!isScanning && status.type !== 'loading' && (
                    <div className="text-center">
                      <Button onClick={handleRescan} className="gap-2">
                        <Camera className="h-4 w-4" />
                        Start Scanning
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Make sure the QR code is well-lit and clearly visible</p>
          </div>
        </div>
      </div>
    </div>
  )
}
