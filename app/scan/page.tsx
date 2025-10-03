'use client'

import { useEffect, useRef, useState } from 'react'
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
  const [scanResults, setScanResults] = useState<string[]>([])
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [policyBlocked, setPolicyBlocked] = useState(false)
  const scannerRef = useRef<any | null>(null) // Html5QrcodeScanner | null
  const lastScanRef = useRef<string>('')
  const lastScanTimeRef = useRef<number>(0)
  const scannerElementId = 'qr-reader'

  // Modern permissions + header check
  const checkPermissionsPolicy = async (): Promise<boolean> => {
    // If inside an iframe without allow attribute, camera may be blocked.
    try {
      if (typeof window !== 'undefined' && window !== window.top) {
        console.log('Diagnostics: Running inside an iframe')
      }
    } catch (e) {
      console.log('iframe check failed', e)
    }

    // 1) Try navigator.permissions (may not be implemented everywhere)
    try {
      if (navigator.permissions && (navigator.permissions as any).query) {
        const res = await (navigator.permissions as any).query({ name: 'camera' })
        console.log('Diagnostics: permissions.query camera state =', res.state)
        if (res.state === 'denied') {
          setPolicyBlocked(true)
          setStatus({
            type: 'error',
            message: 'Camera access denied in browser settings (permissions API).',
          })
          return false
        }
      } else {
        console.log('Diagnostics: navigator.permissions.query not supported in this browser')
      }
    } catch (e) {
      console.log('Diagnostics: permissions.query failed', e)
    }

    // 2) Fetch main document to inspect Permissions-Policy header
    try {
      const r = await fetch(window.location.href, { credentials: 'same-origin' })
      const p =
        r.headers.get('permissions-policy') ||
        r.headers.get('Permissions-Policy') ||
        r.headers.get('permission-policy')
      console.log('Diagnostics: permissions-policy header:', p)
      if (p) {
        const normalized = p.toLowerCase()
        if (
          normalized.includes('camera=()') ||
          normalized.includes('camera=none') ||
          normalized.includes('camera="none"')
        ) {
          setPolicyBlocked(true)
          setStatus({
            type: 'error',
            message: 'Camera blocked by server Permissions-Policy. Check response headers.',
          })
          return false
        }
      }
    } catch (e) {
      console.log('Diagnostics: header fetch failed', e)
    }

    return true
  }

  const handleScanSuccess = async (decodedText: string) => {
    const now = Date.now()
    if (decodedText === lastScanRef.current && now - lastScanTimeRef.current < 2000) return
    lastScanRef.current = decodedText
    lastScanTimeRef.current = now
    console.log('QR Code scanned:', decodedText)
    setScanResults((prev) => (prev.includes(decodedText) ? prev : [decodedText, ...prev]))

    setStatus({ type: 'loading', message: 'Sending data to webhook...' })
    try {
      const res = await fetch(
        'https://primary-production-6fc94.up.railway.app/webhook-test/scan-qr',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qr_data: decodedText, timestamp: new Date().toISOString() }),
        }
      )
      if (!res.ok) throw new Error(`Webhook failed ${res.status}`)
      await res.json().catch(() => ({}))
      setStatus({
        type: 'success',
        message: '✅ Webhook executed successfully! Data sent and received.',
      })
      // optional audio...
    } catch (err) {
      console.error('Processing error:', err)
      setStatus({
        type: 'error',
        message: '❌ Failed to send to webhook. Check console for details.',
      })
    }
  }

  const handleScanError = (error: string) => {
    // keep your ignore list
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

    setStatus({ type: 'loading', message: 'Checking permissions & initializing camera...' })
    setIsScanning(true)

    const ok = await checkPermissionsPolicy()
    if (!ok) {
      setIsScanning(false)
      return
    }

    // Check if we're on HTTPS or localhost
    if (
      location.protocol !== 'https:' &&
      location.hostname !== 'localhost' &&
      location.hostname !== '127.0.0.1'
    ) {
      setStatus({
        type: 'error',
        message: 'Camera access requires HTTPS or localhost. Please use HTTPS or run locally.',
      })
      setIsScanning(false)
      return
    }

    // dynamic import to avoid SSR-time issues
    try {
      const mod = await import('html5-qrcode')
      const Html5QrcodeScanner =
        (mod as any).Html5QrcodeScanner ?? (mod as any).default?.Html5QrcodeScanner
      if (!Html5QrcodeScanner) {
        throw new Error('Html5QrcodeScanner not found in module')
      }

      // Enhanced configuration for better performance
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
        useBarCodeDetectorIfSupported: true,
      }

      scannerRef.current = new Html5QrcodeScanner(scannerElementId, config, false)
      scannerRef.current.render(handleScanSuccess, (err: any) => handleScanError(String(err)))
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
        .catch((err: any) => {
          console.error('Failed to clear scanner:', err)
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
        scannerRef.current.clear().catch((error: any) => console.error('Cleanup error:', error))
      }
    }
  }, [])

  // Render UI (kept similar to your existing UI for consistency)
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
              {policyBlocked ? (
                <div className="py-12 text-center">
                  <Camera className="mx-auto mb-4 h-16 w-16 text-red-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Camera Blocked by Browser Policy
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Camera access requires HTTPS or a permissive Permissions-Policy header.
                  </p>
                  <div className="rounded-lg bg-red-50 p-4 text-left">
                    <h4 className="mb-2 font-medium text-red-800">To fix this issue:</h4>
                    <ul className="space-y-1 text-sm text-red-700">
                      <li>• Ensure your site uses HTTPS or localhost</li>
                      <li>• Ensure server does NOT return Permissions-Policy: camera=()</li>
                      <li>
                        • Use Next.js headers (next.config.js) or server middleware to allow camera
                      </li>
                    </ul>
                  </div>
                </div>
              ) : permissionDenied ? (
                <div className="py-12 text-center">
                  <Camera className="mx-auto mb-4 h-16 w-16 text-red-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Camera Permission Denied
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Please allow camera access in your browser settings and refresh the page.
                  </p>
                  <Button onClick={() => window.location.reload()} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh Page
                  </Button>
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

          {/* results UI same as your current implementation */}
        </div>
      </div>
    </div>
  )
}
