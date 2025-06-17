import { createClient } from '@/lib/supabase/client'

interface ErrorEvent {
  message: string
  stack?: string
  url?: string
  line?: number
  column?: number
  userAgent?: string
  userId?: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: Record<string, any>
}

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: string
  userId?: string
  page?: string
  context?: Record<string, any>
}

interface UserActivity {
  userId: string
  action: string
  resource?: string
  metadata?: Record<string, any>
  timestamp: string
  ip?: string
  userAgent?: string
}

class MonitoringService {
  private errorQueue: ErrorEvent[] = []
  private performanceQueue: PerformanceMetric[] = []
  private activityQueue: UserActivity[] = []
  private flushInterval = 30000 // 30 seconds
  private maxQueueSize = 100

  constructor() {
    // Flush queues periodically
    setInterval(() => this.flushQueues(), this.flushInterval)
    
    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flushQueues())
    }
  }

  // Error tracking
  trackError(error: Error | string, context?: Record<string, any>, severity: ErrorEvent['severity'] = 'medium'): void {
    const errorEvent: ErrorEvent = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
      severity,
      context
    }

    this.errorQueue.push(errorEvent)
    
    if (this.errorQueue.length >= this.maxQueueSize) {
      this.flushErrors()
    }

    // Log critical errors immediately
    if (severity === 'critical') {
      this.flushErrors()
    }
  }

  // Performance monitoring
  trackPerformance(name: string, value: number, unit: string = 'ms', context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
      context
    }

    this.performanceQueue.push(metric)
    
    if (this.performanceQueue.length >= this.maxQueueSize) {
      this.flushPerformance()
    }
  }

  // User activity tracking
  trackActivity(action: string, resource?: string, metadata?: Record<string, any>): void {
    const activity: UserActivity = {
      userId: '', // Will be set when flushing
      action,
      resource,
      metadata,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    }

    this.activityQueue.push(activity)
    
    if (this.activityQueue.length >= this.maxQueueSize) {
      this.flushActivities()
    }
  }

  // Core Web Vitals tracking
  trackWebVitals(): void {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.trackPerformance('LCP', lastEntry.startTime, 'ms', {
        element: lastEntry.element?.tagName
      })
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        this.trackPerformance('FID', entry.processingStart - entry.startTime, 'ms', {
          eventType: entry.name
        })
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.trackPerformance('CLS', clsValue, 'score')
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // Resource monitoring
  trackResourceUsage(): void {
    if (typeof window === 'undefined') return

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.trackPerformance('memory_used', memory.usedJSHeapSize, 'bytes')
      this.trackPerformance('memory_total', memory.totalJSHeapSize, 'bytes')
      this.trackPerformance('memory_limit', memory.jsHeapSizeLimit, 'bytes')
    }

    // Connection info
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.trackPerformance('connection_downlink', connection.downlink, 'mbps')
      this.trackPerformance('connection_rtt', connection.rtt, 'ms')
    }
  }

  private async flushQueues(): Promise<void> {
    await Promise.all([
      this.flushErrors(),
      this.flushPerformance(),
      this.flushActivities()
    ])
  }

  private async flushErrors(): Promise<void> {
    if (this.errorQueue.length === 0) return

    try {
      const supabase = createClient()
      const errors = [...this.errorQueue]
      this.errorQueue = []

      await supabase.from('error_logs').insert(errors)
    } catch (error) {
      console.error('Failed to flush error logs:', error)
      // Re-add errors to queue for retry
      this.errorQueue.unshift(...this.errorQueue)
    }
  }

  private async flushPerformance(): Promise<void> {
    if (this.performanceQueue.length === 0) return

    try {
      const supabase = createClient()
      const metrics = [...this.performanceQueue]
      this.performanceQueue = []

      await supabase.from('performance_metrics').insert(metrics)
    } catch (error) {
      console.error('Failed to flush performance metrics:', error)
    }
  }

  private async flushActivities(): Promise<void> {
    if (this.activityQueue.length === 0) return

    try {
      const supabase = createClient()
      const activities = [...this.activityQueue]
      this.activityQueue = []

      await supabase.from('user_activities').insert(activities)
    } catch (error) {
      console.error('Failed to flush user activities:', error)
    }
  }
}

// Global monitoring instance
export const monitoring = new MonitoringService()

// Utility functions
export function trackError(error: Error | string, context?: Record<string, any>, severity?: ErrorEvent['severity']): void {
  monitoring.trackError(error, context, severity)
}

export function trackPerformance(name: string, value: number, unit?: string, context?: Record<string, any>): void {
  monitoring.trackPerformance(name, value, unit, context)
}

export function trackActivity(action: string, resource?: string, metadata?: Record<string, any>): void {
  monitoring.trackActivity(action, resource, metadata)
}

export function initializeMonitoring(): void {
  if (typeof window === 'undefined') return

  // Track page load performance
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    trackPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart)
    trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart)
    trackPerformance('first_byte', navigation.responseStart - navigation.fetchStart)
  })

  // Track unhandled errors
  window.addEventListener('error', (event) => {
    trackError(event.error || event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }, 'high')
  })

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackError(event.reason, { type: 'unhandled_promise_rejection' }, 'high')
  })

  // Initialize Web Vitals tracking
  monitoring.trackWebVitals()
  
  // Track resource usage periodically
  setInterval(() => monitoring.trackResourceUsage(), 60000) // Every minute
}