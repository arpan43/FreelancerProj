import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText } from "lucide-react"
import Link from "next/link"

export default async function InvoicesPage() {
  const supabase = createClient()

  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      *,
      clients (
        name,
        company
      )
    `)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage and track your invoices</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard/invoices/new">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Link>
        </Button>
      </div>

      {!invoices || invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
            <p className="text-gray-500 text-center mb-6">Get started by creating your first invoice</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/invoices/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Invoice #{invoice.invoice_number}</CardTitle>
                    <CardDescription>
                      {invoice.clients?.name || invoice.clients?.company || "No client"}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">
                      Created: {new Date(invoice.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${Number(invoice.total_amount).toLocaleString()}</p>
                    <div className="flex space-x-2 mt-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/invoices/${invoice.id}`}>View</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/invoices/${invoice.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
