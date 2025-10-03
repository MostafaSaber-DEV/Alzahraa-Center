'use client'

import { useEffect, useRef, useState } from 'react'

export default function AlternativeQRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [result, setResult] = useState<string>('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        // Check if we're on HTTPS or localhost
        if (
          location.protocol !== 'https:' &&
          location.hostname !== 'localhost' &&
          location.hostname !== '127.0.0.1'
        ) {
          setResult('Camera access requires HTTPS or localhost. Please use HTTPS or run locally.')
          return
        }

        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setResult('Camera access not supported in this browser')
          return
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          setResult('Camera started successfully!')
        }
      } catch (error: any) {
        console.error('Camera error:', error)
        let errorMessage = 'Camera failed: '

        if (error.name === 'NotAllowedError') {
          errorMessage += 'Permission denied. Please allow camera access.'
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera found. Please connect a camera.'
        } else if (error.name === 'NotSupportedError') {
          errorMessage += 'Camera not supported in this browser.'
        } else {
          errorMessage += error.message
        }

        setResult(errorMessage)
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isClient])

  if (!isClient) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <h2>Alternative Camera Test</h2>
      <video
        ref={videoRef}
        width="400"
        height="300"
        autoPlay
        playsInline
        style={{ border: '1px solid black' }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={{ marginTop: 10 }}>{result}</div>
    </div>
  )
}
