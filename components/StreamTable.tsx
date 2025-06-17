import React from 'react'
import { FileVideo, ExternalLink, Calendar, User } from 'lucide-react'
import { StreamStatus } from './StreamStatus'
import { Button } from './ui/button'
import { formatDate, getVideoSourceDisplay } from '@/lib/utils'
import { StreamSession } from '@/lib/types'

interface StreamTableProps {
  sessions: StreamSession[]
  onStopStream?: (sessionId: string) => void
  showUserColumn?: boolean
  loading?: boolean
}

export function StreamTable({ 
  sessions, 
  onStopStream, 
  showUserColumn = false,
  loading = false 
}: StreamTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <FileVideo className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No stream sessions found</p>
          <p className="text-sm text-gray-500">Stream sessions will appear here once created</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Video Source</th>
              <th className="text-left p-4 font-medium text-gray-600">Status</th>
              <th className="text-left p-4 font-medium text-gray-600">Created</th>
              {showUserColumn && (
                <th className="text-left p-4 font-medium text-gray-600">User</th>
              )}
              <th className="text-left p-4 font-medium text-gray-600">Duration</th>
              <th className="text-left p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sessions.map((session) => {
              const sourceInfo = getVideoSourceDisplay(session.video_source)
              const duration = session.started_at && session.stopped_at
                ? Math.floor((new Date(session.stopped_at).getTime() - new Date(session.started_at).getTime()) / 1000 / 60)
                : session.started_at
                ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000 / 60)
                : 0

              return (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileVideo className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{sourceInfo}</p>
                        {session.container_id && (
                          <p className="text-xs text-gray-500">
                            Container: {session.container_id.substring(0, 12)}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <StreamStatus status={session.status} />
                    {session.status === 'running' && (
                      <div className="flex items-center space-x-1 text-green-600 text-xs mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Live</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(session.created_at)}</span>
                    </div>
                  </td>
                  {showUserColumn && (
                    <td className="p-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{session.user_id.substring(0, 8)}...</span>
                      </div>
                    </td>
                  )}
                  <td className="p-4">
                    <span className="text-sm text-gray-600">
                      {duration > 0 ? `${duration} min` : '-'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {(session.status === 'running' || session.status === 'starting') && onStopStream && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStopStream(session.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Stop
                        </Button>
                      )}
                      {session.status === 'error' && (
                        <span className="text-xs text-red-600">Check logs</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}