import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP } from '@/lib/rate-limiting'
import { listDatabaseBackups } from '@/lib/backup'

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    
    // Rate limiting
    const rateLimitResult = await checkRateLimit('admin', clientIP)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const supabase = createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // List backups
    const backups = await listDatabaseBackups()

    return NextResponse.json({
      backups,
      count: backups.length
    })

  } catch (error) {
    console.error('Backup list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}