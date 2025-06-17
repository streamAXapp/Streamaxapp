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
    const { metrics } = body

    if (!Array.isArray(metrics)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // Insert performance metrics
    const { error } = await supabase
      .from('performance_metrics')
      .insert(metrics.map(metric => ({
        ...metric,
        created_at: new Date().toISOString()
      })))

    if (error) {
      console.error('Failed to insert performance metrics:', error)
      return NextResponse.json(
        { error: 'Failed to log metrics' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Performance logging endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'
    const metric = searchParams.get('metric')

    const supabase = createClient()
    
    // Calculate time range
    const now = new Date()
    const timeRanges = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const startTime = timeRanges[timeframe as keyof typeof timeRanges] || timeRanges['24h']

    let query = supabase
      .from('performance_metrics')
      .select('*')
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: false })

    if (metric) {
      query = query.eq('name', metric)
    }

    const { data, error } = await query.limit(1000)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch metrics' },
        { status: 500 }
      )
    }

    // Calculate aggregations
    const aggregations = data?.reduce((acc, curr) => {
      const metricName = curr.name
      if (!acc[metricName]) {
        acc[metricName] = {
          count: 0,
          sum: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0
        }
      }

      acc[metricName].count++
      acc[metricName].sum += curr.value
      acc[metricName].min = Math.min(acc[metricName].min, curr.value)
      acc[metricName].max = Math.max(acc[metricName].max, curr.value)
      acc[metricName].avg = acc[metricName].sum / acc[metricName].count

      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      data,
      aggregations,
      timeframe,
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Performance metrics fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}