import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/topbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDateRangePicker } from '@/components/date-range-picker'
import { DollarSign, TrendingUp, Users, Target, Plus } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic imports for heavy components
const Overview = dynamic(
  () => import('@/components/overview').then((mod) => ({ default: mod.Overview })),
  {
    loading: () => <div className="h-[350px] animate-pulse rounded-md bg-muted" />,
  }
)

const RecentSales = dynamic(
  () => import('@/components/recent-sales').then((mod) => ({ default: mod.RecentSales })),
  {
    loading: () => (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    ),
  }
)

const DataTable = dynamic(
  () => import('@/components/data-table').then((mod) => ({ default: mod.DataTable })),
  {
    loading: () => <div className="h-[400px] animate-pulse rounded-md bg-muted" />,
  }
)

const dashboardStats = [
  {
    title: 'Monthly Revenue',
    value: '$48,500',
    description: '+12.5% from last month',
    icon: DollarSign,
  },
  {
    title: 'Total Students',
    value: '12',
    description: '+3 from last month',
    icon: Target,
  },
  {
    title: 'Total Groups',
    value: '$320,000',
    description: '+8.2% total pipeline',
    icon: TrendingUp,
  },
  {
    title: 'Total Subscriptions',
    value: '18.4%',
    description: '+2.1% lead to close',
    icon: Users,
  },
]

export default async function Dashboard() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />

      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Report
            </Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="deals">All Deals</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {dashboardStats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue and deals closed over time</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <Suspense
                    fallback={<div className="h-[350px] animate-pulse rounded-md bg-muted" />}
                  >
                    <Overview />
                  </Suspense>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>Latest deals closed by your team</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
                        ))}
                      </div>
                    }
                  >
                    <RecentSales />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="deals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Deals</CardTitle>
                <CardDescription>
                  Comprehensive view of all deals with advanced filtering and sorting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense
                  fallback={<div className="h-[400px] animate-pulse rounded-md bg-muted" />}
                >
                  <DataTable />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {dashboardStats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Detailed analytics and performance metrics coming soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                  Advanced analytics features will be available here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>Generate and download comprehensive sales reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                  Report generation features will be available here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
