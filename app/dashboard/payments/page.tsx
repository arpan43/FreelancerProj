import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, Calendar } from "lucide-react"

export default async function PaymentsPage() {
  const supabase = createClient()

  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      invoices (
        invoice_number,
        title,
        clients (
          name,
          company
        )
      )
    `)
    .order("created_at", { ascending: false })

  const totalReceived =
    payments
      ?.filter((payment) => payment.status === "completed")
      .reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

  const pendingPayments = payments?.filter((payment) => payment.status === "pending").length || 0

  const thisMonthPayments =
    payments?.filter((payment) => {
      const paymentDate = new Date(payment.processed_at || payment.created_at)
      const now = new Date()
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear()
    }) || []

  const thisMonthTotal = thisMonthPayments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + Number(payment.amount), 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Track and manage your payment history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Received</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalReceived.toLocaleString()}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${thisMonthTotal.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{thisMonthPayments.length} payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-gray-500">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Recent payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
              <p className="text-gray-500">Payment history will appear here once you start receiving payments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">
                          {payment.invoices?.title || `Invoice #${payment.invoices?.invoice_number}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payment.invoices?.clients?.name || payment.invoices?.clients?.company || "Unknown Client"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.payment_method} • {payment.payment_reference || "No reference"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${Number(payment.amount).toLocaleString()}</p>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(payment.processed_at || payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
