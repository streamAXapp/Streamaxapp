import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Layout } from '@/components/layout/layout'
import { DashboardStats } from '@/components/dashboard/stats'
import { RecentStreams } from '@/components/dashboard/recent-streams'
import { QuickActions } from '@/components/dashboard/quick-actions'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    redirect('/login')
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user) {
    redirect('/login')
  }

  return (
    <Layout user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user.email}! Manage your streams and monitor your activity.
          </p>
        </div>

        <DashboardStats user={user} />
        <QuickActions user={user} />
        <RecentStreams user={user} />
      </div>
    </Layout>
  )
}