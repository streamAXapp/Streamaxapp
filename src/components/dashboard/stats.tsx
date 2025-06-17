import { Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { User } from '@/lib/types'

interface DashboardStatsProps {
  user: User
}

export function DashboardStats({ user }: DashboardStatsProps) {
  const isPackageActive = user.package_expires_at && new Date(user.package_expires_at) > new Date()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Streams</p>
            <p className="text-2xl font-bold text-gray-800">
              {user.streams_active}/{user.streams_allowed}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Package Status</p>
            <p className="text-lg font-semibold text-gray-800">
              {isPackageActive ? (
                <span className="text-green-600 capitalize">{user.package_type}</span>
              ) : (
                <span className="text-gray-500">No Package</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Package Expires</p>
            <p className="text-sm font-medium text-gray-800">
              {isPackageActive ? (
                new Date(user.package_expires_at!).toLocaleDateString()
              ) : (
                'N/A'
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Account Type</p>
            <p className="text-lg font-semibold text-gray-800 capitalize">
              {user.role}
              {user.role === 'admin' && (
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  Admin
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}