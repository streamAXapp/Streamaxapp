'use client'

import { useEffect, useRef } from 'react'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: string
  page?: string
  context?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observer?: PerformanceObserver
  private flushInterval: NodeJS.Timeout | null = null
  private readonly FLUSH_INTERVAL = 30000 // 30 seconds
  private readonly MAX_METRICS = 100

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
      this.startPeriodicFlush()
    }
  }

  private initializeObservers() {
    // Core Web Vitals
    this.observeLCP()
    this.observeFID()
    this.observeCLS()
    
    // Navigation timing
    this.observeNavigation()
    
    // Resource timing
    this.observeResources()
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        
        this.addMetric({
          name: 'LCP',
          value: lastEntry.startTime,
          unit: 'ms',
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          context: {
            element: lastEntry.element?.tagName,
            url: lastEntry.url
          }
        })
      })
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('LCP observation not supported:', error)
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.addMetric({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            unit: 'ms',
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            context: {
              eventType: entry.name,
              target: entry.target?.tagName
            }
          })
        })
      })
      
      observer.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('FID observation not supported:', error)
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        
        this.addMetric({
          name: 'CLS',
          value: clsValue,
          unit: 'score',
          timestamp: new Date().toISOString(),
          page: window.location.pathname
        })
      })
      
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('CLS observation not supported:', error)
    }
  }

  private observeNavigation() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.addMetric({
            name: 'navigation_duration',
            value: entry.duration,
            unit: 'ms',
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            context: {
              type: entry.type,
              redirectCount: entry.redirectCount
            }
          })

          // DNS lookup time
          if (entry.domainLookupEnd && entry.domainLookupStart) {
            this.addMetric({
              name: 'dns_lookup',
              value: entry.domainLookupEnd - entry.domainLookupStart,
              unit: 'ms',
              timestamp: new Date().toISOString(),
              page: window.location.pathname
            })
          }

          // TCP connection time
          if (entry.connectEnd && entry.connectStart) {
            this.addMetric({
              name: 'tcp_connection',
              value: entry.connectEnd - entry.connectStart,
              unit: 'ms',
              timestamp: new Date().toISOString(),
              page: window.location.pathname
            })
          }

          // Time to first byte
          if (entry.responseStart && entry.requestStart) {
            this.addMetric({
              name: 'ttfb',
              value: entry.responseStart - entry.requestStart,
              unit: 'ms',
              timestamp: new Date().toISOString(),
              page: window.location.pathname
            })
          }
        })
      })
      
      observer.observe({ entryTypes: ['navigation'] })
    } catch (error) {
      console.warn('Navigation observation not supported:', error)
    }
  }

  private observeResources() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          // Only track important resources
          if (entry.initiatorType === 'script' || 
              entry.initiatorType === 'css' || 
              entry.initiatorType === 'img') {
            
            this.addMetric({
              name: `resource_${entry.initiatorType}`,
              value: entry.duration,
              unit: 'ms',
              timestamp: new Date().toISOString(),
              page: window.location.pathname,
              context: {
                name: entry.name,
                size: entry.transferSize,
                cached: entry.transferSize === 0
              }
            })
          }
        })
      })
      
      observer.observe({ entryTypes: ['resource'] })
    } catch (error) {
      console.warn('Resource observation not supported:', error)
    }
  }

  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // Prevent memory leaks by limiting stored metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }
  }

  private startPeriodicFlush() {
    this.flushInterval = setInterval(() => {
      this.flushMetrics()
    }, this.FLUSH_INTERVAL)

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushMetrics()
    })
  }

  private async flushMetrics() {
    if (this.metrics.length === 0) return

    const metricsToSend = [...this.metrics]
    this.metrics = []

    try {
      await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: metricsToSend
        })
      })
    } catch (error) {
      console.error('Failed to send performance metrics:', error)
      // Re-add metrics for retry
      this.metrics.unshift(...metricsToSend.slice(-10)) // Keep last 10 for retry
    }
  }

  // Manual metric tracking
  public trackCustomMetric(name: string, value: number, unit: string = 'ms', context?: Record<string, any>) {
    this.addMetric({
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      context
    })
  }

  // Track user interactions
  public trackInteraction(action: string, element?: string, duration?: number) {
    this.addMetric({
      name: 'user_interaction',
      value: duration || 0,
      unit: 'ms',
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      context: {
        action,
        element
      }
    })
  }

  // Track API calls
  public trackAPICall(endpoint: string, duration: number, status: number) {
    this.addMetric({
      name: 'api_call',
      value: duration,
      unit: 'ms',
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      context: {
        endpoint,
        status,
        success: status >= 200 && status < 300
      }
    })
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
    
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    
    // Final flush
    this.flushMetrics()
  }
}

// Global instance
let performanceMonitor: PerformanceMonitor | null = null

export function usePerformanceMonitor() {
  const monitorRef = useRef<PerformanceMonitor | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !performanceMonitor) {
      performanceMonitor = new PerformanceMonitor()
      monitorRef.current = performanceMonitor
    }

    return () => {
      // Don't destroy global instance, just clean up ref
      monitorRef.current = null
    }
  }, [])

  return {
    trackCustomMetric: (name: string, value: number, unit?: string, context?: Record<string, any>) => {
      performanceMonitor?.trackCustomMetric(name, value, unit, context)
    },
    trackInteraction: (action: string, element?: string, duration?: number) => {
      performanceMonitor?.trackInteraction(action, element, duration)
    },
    trackAPICall: (endpoint: string, duration: number, status: number) => {
      performanceMonitor?.trackAPICall(endpoint, duration, status)
    }
  }
}

// HOC for automatic performance tracking
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  return function PerformanceTrackedComponent(props: P) {
    const { trackCustomMetric, trackInteraction } = usePerformanceMonitor()
    const renderStartTime = useRef(Date.now())

    useEffect(() => {
      const renderTime = Date.now() - renderStartTime.current
      trackCustomMetric(
        'component_render',
        renderTime,
        'ms',
        { component: componentName || WrappedComponent.name }
      )
    }, [trackCustomMetric])

    const handleClick = (event: React.MouseEvent) => {
      trackInteraction('click', (event.target as HTMLElement)?.tagName)
    }

    return (
      <div onClick={handleClick}>
        <WrappedComponent {...props} />
      </div>
    )
  }
}

export default PerformanceMonitor