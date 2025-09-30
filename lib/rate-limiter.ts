import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimit(request: NextRequest): NextResponse | null {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous'
    const now = Date.now()
    const key = `${ip}:${request.nextUrl.pathname}`

    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }

    const current = rateLimitStore.get(key) || { count: 0, resetTime: now + config.windowMs }

    if (current.resetTime < now) {
      current.count = 1
      current.resetTime = now + config.windowMs
    } else {
      current.count++
    }

    rateLimitStore.set(key, current)

    if (current.count > config.maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
          },
        }
      )
    }

    return null // No rate limit exceeded
  }
}

// Pre-configured rate limiters
export const apiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
})

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
})
