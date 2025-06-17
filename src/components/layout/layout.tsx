import { Header } from './header'
import { MobileNav } from './mobile-nav'
import { User } from '@/lib/types'

interface LayoutProps {
  children: React.ReactNode
  user: User | null
}

export function Layout({ children, user }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {children}
      </main>
      <MobileNav user={user} />
    </div>
  )
}