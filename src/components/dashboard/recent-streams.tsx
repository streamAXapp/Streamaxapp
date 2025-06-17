import { createClient } from '@/lib/supabase/server'
import { FileVideo, Clock, CheckCircle, XCircle, Play } from 'lucide-react'
import { User } from '@/lib/types'
import { getStatusColor, formatDate } from '@/lib/utils'

interface RecentStreamsProps {
  user: User
}

export async function RecentStreams({ user }: RecentStreamsProps) {
  const supabase = createClient()
  
  const { data: requests } = await supabase
    .from('stream_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Stream Requests</h3>
        <div className="text-center py-8">
          <FileVideo className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No stream requests yet</p>
          <p className="text-sm text-gray-500">Create your first stream request to get started</p>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      case 'streaming':
        return <Play className="w-4 h-4" />
      default:
        return <FileVideo className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Stream Requests</h3>
      
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileVideo className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{request.title}</h4>
                <p className="text-sm text-gray-600">
                  Created {formatDate(request.created_at)}
                </p>
                {request.admin_notes && (
                  <p className="text-sm text-gray-500 mt-1">
                    Note: {request.admin_notes}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="capitalize">{request.status}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}