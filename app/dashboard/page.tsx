import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, DollarSign, Clock, TrendingUp, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import RevenueChart from "@/components/revenue-chart"
import ActivityFeed from "@/components/activity-feed"

export default async function DashboardPage() {
  const supabase = createClient()

  // Get comprehensive dashboard data
  const [invoicesResult, clientsResult, proposalsResult] = await Promise.all([
    supabase.from("invoices").select("id, status, total_amount, created_at, due_date, clients(name, company)"),
    supabase.from("clients").select("id, name, created_at"),
    supabase.from("proposals").select("id, status, total_amount, created_at, clients(name, company)"),
  ])

  const invoices = invoicesResult.data || []
  const clients = clientsResult.data || []
  const proposals = proposalsResult.data || []

  // Calculate comprehensive stats
  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + Number(inv.total_amount), 0)

  const pendingRevenue = invoices
    .filter((inv) => inv.status === "sent")
    .reduce((sum, inv) => sum + Number(inv.total_amount), 0)

  const pendingInvoices = invoices.filter((inv) => inv.status === "sent").length
  const overdueInvoices = invoices.filter((inv) => {
    return inv.status === "sent" && new Date(inv.due_date) < new Date()
  }).length

  const totalClients = clients.length
  const activeProposals = proposals.filter((prop) => prop.status === "sent").length
  const approvedProposals = proposals.filter((prop) => prop.status === "approved").length

  // Calculate monthly revenue for the last 6 months
  const monthlyRevenue = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const monthRevenue = invoices
      .filter((inv) => {
        const createdDate = new Date(inv.created_at)
        return inv.status === "paid" && createdDate >= monthStart && createdDate <= monthEnd
      })
      .reduce((sum, inv) => sum + Number(inv.total_amount), 0)

    monthlyRevenue.push({
      month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      revenue: monthRevenue,
    })
  }

  // Recent activity (last 10 items)
  const recentActivity = [
    ...invoices.slice(0, 5).map((inv) => ({
      id: inv.id,
      type: "invoice",
      title: `Invoice for ${inv.clients?.name || inv.clients?.company || "Unknown Client"}`,
      status: inv.status,
      amount: inv.total_amount,
      date: inv.created_at,
    })),
    ...proposals.slice(0, 5).map((prop) => ({
      id: prop.id,
      type: "proposal",
      title: `Proposal for ${prop.clients?.name || prop.clients?.company || "Unknown Client"}`,
      status: prop.status,
      amount: prop.total_amount,
      date: prop.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      description: "From paid invoices",
      icon: DollarSign,
      color: "text-green-600",
      trend: "+12% from last month",
      trendUp: true,
    },
    {
      title: "Pending Revenue",
      value: `$${pendingRevenue.toLocaleString()}`,
      description: "Awaiting payment",
      icon: Clock,
      color: "text-yellow-600",
      trend: `${pendingInvoices} invoices pending`,
      trendUp: null,
    },
    {
      title: "Active Clients",
      value: totalClients.toString(),
      description: "Total clients",
      icon: Users,
      color: "text-blue-600",
      trend: "+3 this month",
      trendUp: true,
    },
    {
      title: "Proposals",
      value: `${approvedProposals}/${activeProposals + approvedProposals}`,
      description: "Approved/Total",
      icon: FileText,
      color: "text-purple-600",
      trend: `${activeProposals} pending approval`,
      trendUp: null,
    },
  ]

  const alerts = []
  if (overdueInvoices > 0) {
    alerts.push({
      type: "warning",
      message: `${overdueInvoices} overdue invoice${overdueInvoices > 1 ? "s" : ""} need attention`,
      action: "/dashboard/invoices",
    })
  }
  if (activeProposals > 0) {
    alerts.push({
      type: "info",
      message: `${activeProposals} proposal${activeProposals > 1 ? "s" : ""} awaiting client response`,
      action: "/dashboard/proposals",
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/proposals/new">New Proposal</Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/invoices/new">Create Invoice</Link>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                alert.type === "warning"
                  ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {alert.type === "warning" ? (
                    <AlertCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  )}
                  <span>{alert.message}</span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={alert.action}>View</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500">{stat.description}</p>
                {stat.trend && (
                  <div className="flex items-center mt-2">
                    {stat.trendUp !== null && (
                      <TrendingUp
                        className={`h-3 w-3 mr-1 ${
                          stat.trendUp ? "text-green-600 rotate-0" : "text-red-600 rotate-180"
                        }`}
                      />
                    )}
                    <span className="text-xs text-gray-600">{stat.trend}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={monthlyRevenue} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest invoices and proposals</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={recentActivity} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>This Month's Performance</CardTitle>
            <CardDescription>
              Key metrics for {new Date().toLocaleDateString("en-US", { month: "long" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Invoices Created</span>
                <span className="font-medium">
                  {
                    invoices.filter((inv) => {
                      const created = new Date(inv.created_at)
                      const now = new Date()
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                    }).length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Proposals Sent</span>
                <span className="font-medium">
                  {
                    proposals.filter((prop) => {
                      const created = new Date(prop.created_at)
                      const now = new Date()
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                    }).length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Clients</span>
                <span className="font-medium">
                  {
                    clients.filter((client) => {
                      const created = new Date(client.created_at)
                      const now = new Date()
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                    }).length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Collection Rate</span>
                <span className="font-medium">
                  {invoices.length > 0
                    ? Math.round((invoices.filter((inv) => inv.status === "paid").length / invoices.length) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start bg-transparent" variant="outline">
              <Link href="/dashboard/invoices/new">
                <FileText className="h-4 w-4 mr-2" />
                Create New Invoice
              </Link>
            </Button>
            <Button asChild className="w-full justify-start bg-transparent" variant="outline">
              <Link href="/dashboard/proposals/new">
                <FileText className="h-4 w-4 mr-2" />
                Write Proposal
              </Link>
            </Button>
            <Button asChild className="w-full justify-start bg-transparent" variant="outline">
              <Link href="/dashboard/clients/new">
                <Users className="h-4 w-4 mr-2" />
                Add New Client
              </Link>
            </Button>
            {overdueInvoices > 0 && (
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/dashboard/invoices">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Review Overdue Invoices
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
