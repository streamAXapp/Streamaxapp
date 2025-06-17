import React from 'react'
import { Activity, CheckCircle, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreamStatusProps {
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error'
  className?: string
  showIcon?: boolean
  showText?: boolean
}

export function StreamStatus({ 
  status, 
  className, 
  showIcon = true, 
  showText = true 
}: StreamStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return {
          icon: CheckCircle,
          text: 'Running',
          color: 'text-green-600 bg-green-100 border-green-200'
        }
      case 'starting':
        return {
          icon: Loader2,
          text: 'Starting',
          color: 'text-yellow-600 bg-yellow-100 border-yellow-200',
          animate: true
        }
      case 'stopping':
        return {
          icon: AlertTriangle,
          text: 'Stopping',
          color: 'text-orange-600 bg-orange-100 border-orange-200'
        }
      case 'stopped':
        return {
          icon: XCircle,
          text: 'Stopped',
          color: 'text-gray-600 bg-gray-100 border-gray-200'
        }
      case 'error':
        return {
          icon: XCircle,
          text: 'Error',
          color: 'text-red-600 bg-red-100 border-red-200'
        }
      default:
        return {
          icon: Activity,
          text: 'Unknown',
          color: 'text-gray-600 bg-gray-100 border-gray-200'
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  return (
    <span className={cn(
      'inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      config.color,
      className
    )}>
      {showIcon && (
        <IconComponent 
          className={cn(
            'w-3 h-3',
            config.animate && 'animate-spin'
          )} 
        />
      )}
      {showText && <span>{config.text}</span>}
    </span>
  )
}