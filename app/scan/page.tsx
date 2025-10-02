'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Topbar } from '@/components/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2,
  Camera,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
} from 'lucide-react'

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
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerElementId = 'qr-reader'

  // Check if we're on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check if we're in a secure context (client-side only)
  const isSecureContext = useCallback(() => {
    if (typeof window === 'undefined') return false
    return (
      window.isSecureContext ||
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost'
    )
  }, [])

  // Create a ref to store the initializeScanner function
  const initializeScannerRef = useRef<() => void>()

  const handleScanSuccess = useCallback(async (decodedText: string) => {
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
          initializeScannerRef.current?.()
        }, 3000)
      } else {
        throw new Error('Failed to process scan')
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Scan failed. Please try again.',
      })
    }
  }, [])

  const initializeScanner = useCallback(async () => {
    // Don't run on server
    if (typeof window === 'undefined') return

    // Check secure context first
    if (!isSecureContext()) {
      setCameraPermissionDenied(true)
      setStatus({
        type: 'error',
        message:
          'Camera access requires HTTPS. Please serve this page over HTTPS or use localhost.',
      })
      return
    }

    // Clear previous scanner
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear()
      } catch (error) {
        console.log('Error clearing previous scanner:', error)
      }
    }

    try {
      // Check camera permissions first
      if (navigator.permissions) {
        const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName })

        if (permissions.state === 'denied') {
          setCameraPermissionDenied(true)
          setStatus({
            type: 'error',
            message:
              'Camera permission denied. Please allow camera access in your browser settings and try again.',
          })
          return
        }
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
          console.error('Scanner error:', error)
          if (error.includes('NotAllowedError') || error.includes('Permission denied')) {
            setCameraPermissionDenied(true)
            setStatus({
              type: 'error',
              message: 'Camera permission denied. Please allow camera access and try again.',
            })
          } else if (error.includes('NotFoundError')) {
            setCameraError(true)
            setStatus({
              type: 'error',
              message: 'No camera found. Please check if your camera is connected properly.',
            })
          } else {
            setCameraError(true)
            setStatus({
              type: 'error',
              message: 'Failed to access camera. Please try again.',
            })
          }
        }
      )

      setIsScanning(true)
      setCameraError(false)
      setCameraPermissionDenied(false)
      setStatus({ type: 'scanning', message: 'Point your camera at a QR code to scan' })
    } catch (error) {
      console.error('Failed to initialize scanner:', error)
      setCameraError(true)
      setStatus({
        type: 'error',
        message: 'Failed to initialize camera. Please check permissions and try again.',
      })
    }
  }, [handleScanSuccess, isSecureContext])

  // Store initializeScanner in ref
  useEffect(() => {
    initializeScannerRef.current = initializeScanner
  }, [initializeScanner])

  // Initialize scanner only on client
  useEffect(() => {
    if (!isClient || scannerRef.current) return
    initializeScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.log('Error clearing scanner:', error)
        })
      }
    }
  }, [initializeScanner, isClient])

  const handleRescan = () => {
    setStatus({ type: 'idle', message: '' })
    setCameraError(false)
    setCameraPermissionDenied(false)
    initializeScanner()
  }

  const openCameraSettings = () => {
    handleRescan()
  }

  const guideToSettings = () => {
    setStatus({
      type: 'warning',
      message:
        'Please check your browser settings and allow camera access for this site, then click "Try Again".',
    })
  }

  // Show loading state while checking client
  if (!isClient) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Topbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading scanner...</p>
          </div>
        </div>
      </div>
    )
  }

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
              {cameraError || cameraPermissionDenied ? (
                <div className="py-12 text-center">
                  <Camera className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    {cameraPermissionDenied
                      ? 'Camera Permission Required'
                      : 'Camera Access Required'}
                  </h3>
                  <p className="mb-6 text-gray-600">
                    {cameraPermissionDenied
                      ? 'Please allow camera access in your browser settings to scan QR codes.'
                      : 'Please allow camera access to scan QR codes, or check if your camera is working properly.'}
                  </p>
                  <div className="space-y-3">
                    <Button onClick={handleRescan} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                    {cameraPermissionDenied && (
                      <Button variant="outline" onClick={guideToSettings} className="gap-2">
                        <Settings className="h-4 w-4" />
                        Browser Settings Help
                      </Button>
                    )}
                  </div>
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
            {!isSecureContext() && (
              <p className="mt-2 text-red-600">
                ⚠️ Camera requires HTTPS or localhost for security
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
