interface CacheItem<T> {
  value: T
  expiry: number
  hits: number
  created: number
}

interface CacheStats {
  size: number
  hits: number
  misses: number
  hitRate: number
  memoryUsage: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  private stats = { hits: 0, misses: 0 }
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize = 1000, defaultTTL = 300000) { // 5 minutes default
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
    
    // Cleanup expired items every minute
    setInterval(() => this.cleanup(), 60000)
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL)
    
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      value,
      expiry,
      hits: 0,
      created: Date.now()
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.misses++
      return null
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    item.hits++
    this.stats.hits++
    return item.value
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    return item !== undefined && Date.now() <= item.expiry
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0 }
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0
    
    // Estimate memory usage (rough calculation)
    const memoryUsage = JSON.stringify([...this.cache.entries()]).length

    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }

  private evictOldest(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.created < oldestTime) {
        oldestTime = item.created
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }
}

// Global cache instance
export const cache = new MemoryCache()

// Cache utility functions
export function cacheKey(...parts: (string | number)[]): string {
  return parts.join(':')
}

export async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  const value = await fetchFn()
  cache.set(key, value, ttl)
  return value
}

// Performance utilities
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Resource cleanup utilities
export class ResourceManager {
  private resources = new Set<() => void>()

  addCleanup(cleanup: () => void): void {
    this.resources.add(cleanup)
  }

  cleanup(): void {
    for (const cleanup of this.resources) {
      try {
        cleanup()
      } catch (error) {
        console.error('Error during cleanup:', error)
      }
    }
    this.resources.clear()
  }
}

export function createResourceManager(): ResourceManager {
  return new ResourceManager()
}