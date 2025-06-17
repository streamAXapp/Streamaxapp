export interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string
  package_type?: 'starter' | 'creator' | 'pro'
  package_expires_at?: string
  streams_allowed: number
  streams_active: number
}

export interface StreamSession {
  id: string
  user_id: string
  container_id?: string
  rtmp_url: string
  video_source: string
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error'
  created_at: string
  started_at?: string
  stopped_at?: string
}

export interface StreamRequest {
  id: string
  user_id: string
  video_source: string
  video_url?: string
  rtmp_url: string
  title: string
  description?: string
  status: 'pending' | 'approved' | 'rejected' | 'streaming' | 'stopped'
  admin_notes?: string
  created_at: string
  approved_at?: string
  started_at?: string
  stopped_at?: string
}

export interface BackupMetadata {
  id: string
  created_at: string
  size: number
  tables: string[]
  status: 'pending' | 'completed' | 'failed'
  file_path?: string
  checksum?: string
  s3_bucket?: string
  s3_key?: string
}

export interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  timestamp: string
  user_id?: string
  page?: string
  context?: Record<string, any>
  created_at: string
}

export interface ErrorLog {
  id: string
  message: string
  stack?: string
  url?: string
  line?: number
  column?: number
  user_agent?: string
  user_id?: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: Record<string, any>
  ip?: string
  created_at: string
}

export interface UserActivity {
  id: string
  user_id: string
  action: string
  resource?: string
  metadata?: Record<string, any>
  timestamp: string
  ip?: string
  user_agent?: string
  created_at: string
}