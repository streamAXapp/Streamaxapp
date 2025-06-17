'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, Users, FileVideo, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { User } from '@/lib/types'

interface MobileNavProps {
  user: User | null
}

export function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      toast.success('Signed out successfully')
      router.push('/login')
    }
  }

  const isActive = (path: string) => pathname === path

  if (!user) return null

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center space-y-1 p-2 ${
            isActive('/dashboard') ? 'text-purple-600' : 'text-gray-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Dashboard</span>
        </Link>
        
        <Link
          href="/streams"
          className={`flex flex-col items-center space-y-1 p-2 ${
            isActive('/streams') ? 'text-purple-600' : 'text-gray-400'
          }`}
        >
          <FileVideo className="w-5 h-5" />
          <span className="text-xs">Streams</span>
        </Link>
        
        <Link
          href="/packages"
          className={`flex flex-col items-center space-y-1 p-2 ${
            isActive('/packages') ? 'text-purple-600' : 'text-gray-400'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-xs">Packages</span>
        </Link>
        
        {user.role === 'admin' && (
          <Link
            href="/admin"
            className={`flex flex-col items-center space-y-1 p-2 ${
              isActive('/admin') ? 'text-purple-600' : 'text-gray-400'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Admin</span>
          </Link>
        )}
        
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center space-y-1 p-2 text-gray-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </nav>
  )
}