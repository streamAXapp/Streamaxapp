import { createClient } from '@/lib/supabase/server'
import { FileVideo, Clock, CheckCircle, XCircle, Play } from 'lucide-react'
import { User } from '@/lib/types'
import { getStatusColor, formatDate } from '@/lib/utils'

interface RecentStreamsProps {
  user: User
}

export async function RecentStreams({ user }: RecentStreamsProps) {
  const supabase = createClient()
  
  const { data: sessions } = await supabase
    .from('stream_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Stream Sessions</h3>
        <div className="text-center py-8">
          <FileVideo className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No stream sessions yet</p>
          <p className="text-sm text-gray-500">Create your first stream to get started</p>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'starting':
        return <Clock className="w-4 h-4" />
      case 'running':
        return <CheckCircle className="w-4 h-4" />
      case 'stopped':
        return <XCircle className="w-4 h-4" />
      case 'error':
        return <XCircle className="w-4 h-4" />
      default:
        return <FileVideo className="w-4 h-4" />
    }
  }

  const getVideoSourceDisplay = (source: string) => {
    if (source.startsWith('/tmp/')) {
      return `📁 ${source.split('/').pop()}`
    } else if (source.includes('youtube.com') || source.includes('youtu.be')) {
      return '📺 YouTube Video'
    } else if (source.startsWith('http')) {
      return `🔗 ${new URL(source).hostname}`
    }
    return source
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Stream Sessions</h3>
      
      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileVideo className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">
                  {getVideoSourceDisplay(session.video_source)}
                </h4>
                <p className="text-sm text-gray-600">
                  Created {formatDate(session.created_at)}
                </p>
                {session.container_id && (
                  <p className="text-xs text-gray-500">
                    Container: {session.container_id.substring(0, 12)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                {getStatusIcon(session.status)}
                <span className="capitalize">{session.status}</span>
              </span>
              {session.status === 'running' && (
                <div className="flex items-center space-x-1 text-green-600 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}