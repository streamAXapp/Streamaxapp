import { createClient } from '@/lib/supabase/client'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: Request) => string
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  error?: string
}

class RateLimiter {
  private cache = new Map<string, { count: number; resetTime: number }>()
  
  constructor(private config: RateLimitConfig) {}

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const key = `rate_limit:${identifier}`
    
    // Clean expired entries
    this.cleanExpired(now)
    
    const existing = this.cache.get(key)
    const resetTime = existing?.resetTime || now + this.config.windowMs
    
    if (!existing || now > existing.resetTime) {
      // New window
      this.cache.set(key, { count: 1, resetTime })
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime
      }
    }
    
    if (existing.count >= this.config.maxRequests) {
      return {
        success: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime: existing.resetTime,
        error: 'Rate limit exceeded'
      }
    }
    
    // Increment count
    existing.count++
    this.cache.set(key, existing)
    
    return {
      success: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - existing.count,
      resetTime: existing.resetTime
    }
  }
  
  private cleanExpired(now: number) {
    for (const [key, value] of this.cache.entries()) {
      if (now > value.resetTime) {
        this.cache.delete(key)
      }
    }
  }
}

// Rate limit configurations
export const rateLimiters = {
  // API endpoints
  api: new RateLimiter({ windowMs: 60000, maxRequests: 100 }), // 100 req/min
  auth: new RateLimiter({ windowMs: 900000, maxRequests: 5 }), // 5 req/15min
  upload: new RateLimiter({ windowMs: 3600000, maxRequests: 10 }), // 10 req/hour
  stream: new RateLimiter({ windowMs: 300000, maxRequests: 3 }), // 3 req/5min
  
  // User actions
  registration: new RateLimiter({ windowMs: 3600000, maxRequests: 3 }), // 3 reg/hour
  login: new RateLimiter({ windowMs: 900000, maxRequests: 10 }), // 10 login/15min
  
  // Admin actions
  admin: new RateLimiter({ windowMs: 60000, maxRequests: 200 }), // 200 req/min
}

export async function checkRateLimit(
  type: keyof typeof rateLimiters,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = rateLimiters[type]
  return await limiter.checkLimit(identifier)
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || cfIP || 'unknown'
}

export async function logRateLimitViolation(
  type: string,
  identifier: string,
  userAgent?: string
) {
  try {
    const supabase = createClient()
    
    await supabase.from('security_events').insert({
      event_type: 'rate_limit_exceeded',
      identifier,
      metadata: {
        limit_type: type,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Failed to log rate limit violation:', error)
  }
}