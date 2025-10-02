'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
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
  const [scanResults, setScanResults] = useState<string[]>([])
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const lastScanRef = useRef<string>('')
  const lastScanTimeRef = useRef<number>(0)
  const scannerElementId = 'qr-reader'

  const handleScanSuccess = async (decodedText: string) => {
    const now = Date.now()

    // Prevent duplicate scans within 2 seconds
    if (decodedText === lastScanRef.current && now - lastScanTimeRef.current < 2000) {
      return
    }

    lastScanRef.current = decodedText
    lastScanTimeRef.current = now

    console.log('QR Code scanned:', decodedText)

    setScanResults((prev) => {
      if (prev.includes(decodedText)) return prev
      return [decodedText, ...prev]
    })

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
          message: 'Scan successful! Ready for next scan.',
        })
      } else {
        throw new Error('Failed to process scan')
      }
    } catch (error) {
      console.error('Processing error:', error)
      setStatus({
        type: 'error',
        message: 'Failed to process scan. Please try again.',
      })
    }
  }

  const handleScanError = (error: string) => {
    // Ignore common scanning errors
    if (
      error.includes('No QR code found') ||
      error.includes('NotFoundException') ||
      error.includes('No MultiFormat Readers')
    ) {
      return
    }

    console.error('Scanner error:', error)

    if (
      error.includes('NotAllowedError') ||
      error.includes('Permission denied') ||
      error.includes('NotFoundError')
    ) {
      setPermissionDenied(true)
      setIsScanning(false)
      setStatus({
        type: 'error',
        message: 'Camera permission denied or camera not found.',
      })

      // Try to clean up
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
    }
  }

  const startScanner = () => {
    // Don't start if already scanning
    if (scannerRef.current || isScanning) {
      return
    }

    try {
      setStatus({
        type: 'loading',
        message: 'Initializing camera...',
      })

      setIsScanning(true)

      // Give the DOM a moment to render the element
      setTimeout(() => {
        const config = {
          fps: 10,
          qrbox: 250,
          aspectRatio: 1.0,
          disableFlip: false,
        }

        try {
          scannerRef.current = new Html5QrcodeScanner(scannerElementId, config, false)

          scannerRef.current.render(handleScanSuccess, handleScanError)

          setPermissionDenied(false)
          setStatus({
            type: 'scanning',
            message: 'Point your camera at a QR code to scan',
          })
        } catch (err) {
          console.error('Scanner initialization error:', err)
          setIsScanning(false)
          setStatus({
            type: 'error',
            message: 'Failed to initialize scanner. Please try again.',
          })
        }
      }, 100)
    } catch (error) {
      console.error('Failed to start scanner:', error)
      setIsScanning(false)
      setStatus({
        type: 'error',
        message: 'Failed to start camera. Please check permissions.',
      })
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current
        .clear()
        .then(() => {
          scannerRef.current = null
          setIsScanning(false)
          setStatus({ type: 'idle', message: '' })
        })
        .catch((error) => {
          console.error('Failed to clear scanner:', error)
          scannerRef.current = null
          setIsScanning(false)
          setStatus({ type: 'idle', message: '' })
        })
    } else {
      setIsScanning(false)
      setStatus({ type: 'idle', message: '' })
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error('Cleanup error:', error)
        })
      }
    }
  }, [])

  const handleClearResults = () => {
    setScanResults([])
    if (isScanning) {
      setStatus({ type: 'scanning', message: 'Point your camera at a QR code to scan' })
    }
  }

  const handleRetry = () => {
    setPermissionDenied(false)
    setStatus({ type: 'idle', message: '' })

    // Clean up any existing scanner
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {})
      scannerRef.current = null
    }

    setIsScanning(false)

    // Wait a bit before restarting
    setTimeout(() => {
      startScanner()
    }, 500)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold">QR Scanner</h1>
        </div>
      </div>

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
              {permissionDenied ? (
                <div className="py-12 text-center">
                  <Camera className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Camera Permission Required
                  </h3>
                  <p className="mb-6 text-gray-600">Please allow camera access to scan QR codes.</p>
                  <div className="space-y-4">
                    <Button onClick={handleRetry} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                    <div className="rounded-lg bg-blue-50 p-4 text-left">
                      <h4 className="mb-2 font-medium text-blue-800">How to fix camera issues:</h4>
                      <ul className="space-y-1 text-sm text-blue-700">
                        <li>• Click "Allow" when prompted for camera permission</li>
                        <li>• Check browser address bar for camera blocked icon</li>
                        <li>• Make sure camera is not being used by another app</li>
                        <li>• Try using HTTPS instead of HTTP</li>
                        <li>• Refresh the page and try again</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : !isScanning ? (
                <div className="py-12 text-center">
                  <Camera className="mx-auto mb-4 h-16 w-16 text-blue-500" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">Ready to Scan</h3>
                  <p className="mb-6 text-gray-600">
                    Click the button below to start the QR code scanner.
                  </p>
                  <Button onClick={startScanner} className="gap-2">
                    <Camera className="h-4 w-4" />
                    Start Scanner
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    id={scannerElementId}
                    className="mx-auto max-w-sm overflow-hidden rounded-lg"
                  />

                  <div className="space-y-2 text-center">
                    <p className="text-sm text-gray-600">
                      Position the QR code within the frame to scan
                    </p>
                    <Button variant="outline" size="sm" onClick={stopScanner} className="gap-2">
                      Stop Scanner
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {scanResults.length > 0 && (
            <Card className="mt-6 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Scan Results ({scanResults.length})</span>
                  <Button variant="outline" size="sm" onClick={handleClearResults}>
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {scanResults.map((result, index) => (
                    <div
                      key={index}
                      className="break-all rounded-lg bg-gray-50 p-3 font-mono text-sm"
                    >
                      <span className="mr-2 text-gray-500">#{index + 1}:</span>
                      {result}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Make sure the QR code is well-lit and clearly visible</p>
            <p className="mt-1">Works best with HTTPS connection in good lighting</p>
          </div>
        </div>
      </div>
    </div>
  )
}
