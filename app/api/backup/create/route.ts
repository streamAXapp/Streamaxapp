import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP } from '@/lib/rate-limiting'
import { createDatabaseBackup } from '@/lib/backup'

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    
    // Rate limiting - stricter for backup operations
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

    // Create backup
    const result = await createDatabaseBackup()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      backupId: result.backupId,
      size: result.size,
      duration: result.duration
    })

  } catch (error) {
    console.error('Backup creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}