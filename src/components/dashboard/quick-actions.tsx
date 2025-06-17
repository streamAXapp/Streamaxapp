import Link from 'next/link'
import { Plus, Package, FileVideo, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { User } from '@/lib/types'

interface QuickActionsProps {
  user: User
}

export function QuickActions({ user }: QuickActionsProps) {
  const isPackageActive = user.package_expires_at && new Date(user.package_expires_at) > new Date()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isPackageActive ? (
          <Link href="/streams/new">
            <Button className="w-full justify-start">
              <Plus className="w-4 h-4 mr-2" />
              New Stream Request
            </Button>
          </Link>
        ) : (
          <Link href="/packages">
            <Button className="w-full justify-start">
              <Package className="w-4 h-4 mr-2" />
              Choose Package
            </Button>
          </Link>
        )}
        
        <Link href="/streams">
          <Button variant="outline" className="w-full justify-start">
            <FileVideo className="w-4 h-4 mr-2" />
            My Streams
          </Button>
        </Link>
        
        <Link href="/packages">
          <Button variant="outline" className="w-full justify-start">
            <Package className="w-4 h-4 mr-2" />
            View Packages
          </Button>
        </Link>
        
        {user.role === 'admin' && (
          <Link href="/admin">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}