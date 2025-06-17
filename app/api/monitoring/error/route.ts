import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP } from '@/lib/rate-limiting'

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    
    // Rate limiting
    const rateLimitResult = await checkRateLimit('api', clientIP)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { errors } = body

    if (!Array.isArray(errors)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // Insert error logs
    const { error } = await supabase
      .from('error_logs')
      .insert(errors.map(err => ({
        ...err,
        ip: clientIP,
        created_at: new Date().toISOString()
      })))

    if (error) {
      console.error('Failed to insert error logs:', error)
      return NextResponse.json(
        { error: 'Failed to log errors' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error logging endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}