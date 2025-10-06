'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
  ArrowLeft,
} from 'lucide-react'
import { handleWebhookResponse, notifications } from '@/lib/notifications'

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

export default function QRScannerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const groupName = searchParams.get('group')

  const [status, setStatus] = useState<StatusMessage>({ type: 'idle', message: '' })
  const [scanResults, setScanResults] = useState<string[]>([])
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [policyBlocked, setPolicyBlocked] = useState(false)
  const scannerRef = useRef<any | null>(null)
  const lastScanRef = useRef<string>('')
  const lastScanTimeRef = useRef<number>(0)
  const scannerElementId = 'qr-reader'

  const handleScanSuccess = async (decodedText: string) => {
    const now = Date.now()
    if (decodedText === lastScanRef.current && now - lastScanTimeRef.current < 2000) return
    lastScanRef.current = decodedText
    lastScanTimeRef.current = now

    console.log('QR Code scanned:', decodedText)
    setScanResults((prev) => (prev.includes(decodedText) ? prev : [decodedText, ...prev]))

    setStatus({ type: 'loading', message: 'Sending data to webhook...' })

    try {
      const payload = {
        group_name: groupName || 'Unknown Group',
        qr_data: decodedText,
        timestamp: new Date().toISOString(),
      }

      const res = await fetch(
        'https://primary-production-6fc94.up.railway.app/webhook-test/scan-qr',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      // Use notification system for webhook response
      await handleWebhookResponse('https://primary-production-6fc94.up.railway.app/webhook-test/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_data: decodedText, group_name: groupName }),
      })

      setStatus({
        type: 'success',
        message: `✅ Scan successful for ${groupName}! Data sent to webhook.`,
      })
    } catch (err) {
      console.error('Processing error:', err)
      setStatus({
        type: 'error',
        message: '❌ Failed to send to webhook. Check console for details.',
      })
    }
  }

  const handleScanError = (error: string) => {
    if (
      error.includes('No QR code found') ||
      error.includes('NotFoundException') ||
      error.includes('No MultiFormat Readers')
    )
      return

    console.error('Scanner error:', error)
    if (
      error.includes('NotAllowedError') ||
      error.includes('Permission denied') ||
      error.includes('NotFoundError')
    ) {
      setPermissionDenied(true)
      setIsScanning(false)
      setStatus({ type: 'error', message: 'Camera permission denied or camera not found.' })
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
    }
  }

  const startScanner = async () => {
    if (scannerRef.current || isScanning) return

    setStatus({ type: 'loading', message: 'Checking camera permissions...' })
    setIsScanning(true)

    console.log('=== CAMERA DIAGNOSTICS ===')
    console.log('Protocol:', window.location.protocol)
    console.log('Hostname:', window.location.hostname)
    console.log('Secure Context:', window.isSecureContext)

    // Check if we're in a secure context or localhost
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('.local')
    const isSecure = window.location.protocol === 'https:' || window.isSecureContext

    console.log('Is localhost:', isLocalhost)
    console.log('Is secure:', isSecure)
    console.log('Full URL:', window.location.href)

    if (!isSecure && !isLocalhost) {
      setPermissionDenied(true)
      setStatus({
        type: 'error',
        message: 'Camera requires HTTPS or localhost. Current: ' + window.location.protocol,
      })
      setIsScanning(false)
      return
    }

    try {
      setStatus({ type: 'loading', message: 'Testing camera access...' })

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser')
      }

      // Test camera access with more specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment', // Prefer back camera
        },
      })

      console.log('Direct camera test: SUCCESS')
      console.log(
        'Camera tracks:',
        stream.getVideoTracks().map((t) => ({ label: t.label, kind: t.kind }))
      )

      // Stop all tracks
      stream.getTracks().forEach((track) => {
        track.stop()
        console.log('Stopped track:', track.label)
      })
    } catch (error: any) {
      console.error('Direct camera test failed:', error)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)

      let errorMessage = 'Camera access failed'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please connect a camera.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another application.'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints not supported.'
      }

      setPermissionDenied(true)
      setStatus({
        type: 'error',
        message: `${errorMessage} (${error.name})`,
      })
      setIsScanning(false)
      return
    }

    try {
      setStatus({ type: 'loading', message: 'Initializing scanner...' })
      const mod = await import('html5-qrcode')
      const Html5QrcodeScanner = mod.Html5QrcodeScanner || mod.default?.Html5QrcodeScanner

      if (!Html5QrcodeScanner) {
        throw new Error('Html5QrcodeScanner not found')
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
      }

      scannerRef.current = new Html5QrcodeScanner(scannerElementId, config, false)
      scannerRef.current.render(handleScanSuccess, handleScanError)

      setPermissionDenied(false)
      setStatus({ type: 'scanning', message: 'Point your camera at a QR code to scan' })
    } catch (err) {
      console.error('Scanner initialization error:', err)
      setIsScanning(false)
      setStatus({ type: 'error', message: 'Failed to initialize scanner. Please try again.' })
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
        .catch(() => {
          scannerRef.current = null
          setIsScanning(false)
          setStatus({ type: 'idle', message: '' })
        })
    } else {
      setIsScanning(false)
      setStatus({ type: 'idle', message: '' })
    }
  }

  const handleRetry = () => {
    setPermissionDenied(false)
    setPolicyBlocked(false)
    setStatus({ type: 'idle', message: '' })
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {})
      scannerRef.current = null
    }
    setIsScanning(false)
    setTimeout(() => startScanner(), 500)
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Topbar />
      <div className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push('/deals')} className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Groups
            </Button>

            {groupName ? (
              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">QR Code Scanner</h1>
                <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-lg font-semibold text-blue-900">Scanning for: {groupName}</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">QR Code Scanner</h1>
                <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    ⚠️ No group selected. Please return to the group list and choose a group first.
                  </AlertDescription>
                </Alert>
              </div>
            )}
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
              {permissionDenied || policyBlocked ? (
                <div className="py-12 text-center">
                  <Camera className="mx-auto mb-4 h-16 w-16 text-red-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Camera Access Required / مطلوب إذن الكاميرا
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Please allow camera access to scan QR codes.
                    <br />
                    يرجى السماح بالوصول للكاميرا لمسح رموز QR
                  </p>
                  <div className="space-y-4">
                    <Button onClick={handleRetry} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Try Again / حاول مرة أخرى
                    </Button>
                    <div className="rounded-lg bg-blue-50 p-4 text-left text-sm">
                      <h4 className="mb-2 font-medium text-blue-800">
                        How to allow camera / كيفية السماح بالكاميرا:
                      </h4>
                      <ul className="space-y-1 text-blue-700">
                        <li>
                          • Look for camera icon 🎥 in browser address bar / ابحث عن أيقونة الكاميرا
                          في شريط العنوان
                        </li>
                        <li>• Click "Allow" when prompted / اضغط "السماح" عند السؤال</li>
                        <li>
                          • Or go to browser settings → Site permissions → Camera / أو اذهب لإعدادات
                          المتصفح → أذونات الموقع → الكاميرا
                        </li>
                        <li>
                          • Make sure you're using HTTPS or localhost / تأكد من استخدام HTTPS أو
                          localhost
                        </li>
                        <li>
                          • Close other apps using camera / أغلق التطبيقات الأخرى التي تستخدم
                          الكاميرا
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : !isScanning ? (
                <div className="py-12 text-center">
                  <Camera className="mx-auto mb-4 h-16 w-16 text-blue-500" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">Ready to Scan</h3>
                  <p className="mb-6 text-gray-600">
                    {groupName
                      ? `Click to start scanning QR codes for ${groupName}`
                      : 'Scanner ready, but no group selected'}
                  </p>
                  <Button onClick={startScanner} className="gap-2" disabled={!groupName}>
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
                  <span>
                    Scan Results for {groupName} ({scanResults.length})
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setScanResults([])}>
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
        </div>
      </div>
    </div>
  )
}
