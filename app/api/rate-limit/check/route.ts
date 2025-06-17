import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP } from '@/lib/rate-limiting'

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const body = await request.json()
    const { type, identifier } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Rate limit type is required' },
        { status: 400 }
      )
    }

    const rateLimitResult = await checkRateLimit(type, identifier || clientIP)

    return NextResponse.json({
      success: rateLimitResult.success,
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
      resetTime: rateLimitResult.resetTime,
      error: rateLimitResult.error
    }, {
      status: rateLimitResult.success ? 200 : 429,
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      }
    })

  } catch (error) {
    console.error('Rate limit check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}