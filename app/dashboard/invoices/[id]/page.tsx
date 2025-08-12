import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Download, Send, AlertCircle } from "lucide-react"
import Link from "next/link"
import PaymentActions from "@/components/payment-actions"

interface InvoicePageProps {
  params: { id: string }
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  debugger;
  const supabase = createClient()

  let invoice
  let databaseError = false
 
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        clients (
          name,
          company,
          email,
          phone,
          address
        ),
        invoice_items (
          description,
          quantity,
          rate,
          amount
        ),
        payments (
          id,
          amount,
          payment_method,
          status,
          processed_at,
          payment_reference
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Database error:", error)
      // Check if it's a table doesn't exist error
      if (
        error.message?.includes('relation "invoices" does not exist') ||
        error.message?.includes("table") ||
        error.code === "PGRST116"
      ) {
        databaseError = true
      } else {
        notFound()
      }
    } else {
      invoice = data
    }
  } catch (error) {
    debugger;
    console.error("Failed to fetch invoice:", error)
    databaseError = true
  }

  if (databaseError) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Database Setup Required</h3>
            <p className="text-gray-500 text-center mb-6">
              The database tables haven't been created yet. Please run the SQL scripts to set up your database.
            </p>
            <div className="flex space-x-4">
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/invoices">View Invoices</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invoice) {
    notFound()
  }

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice #{invoice.invoice_number}</h1>
          <p className="text-gray-600">Created on {new Date(invoice.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Badge>
          <div className="flex space-x-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            {invoice.status === "draft" && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Title</h4>
                  <p className="text-gray-600">{invoice.title}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Invoice Number</h4>
                  <p className="text-gray-600">{invoice.invoice_number}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Issue Date</h4>
                  <p className="text-gray-600">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Due Date</h4>
                  <p className="text-gray-600">{new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
              </div>
              {invoice.description && (
                <div>
                  <h4 className="font-medium text-gray-900">Description</h4>
                  <p className="text-gray-600">{invoice.description}</p>
                </div>
              )}
              {invoice.payment_terms && (
                <div>
                  <h4 className="font-medium text-gray-900">Payment Terms</h4>
                  <p className="text-gray-600">{invoice.payment_terms}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Description</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Rate</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.invoice_items.map((item: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.description}</td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">${Number(item.rate).toFixed(2)}</td>
                        <td className="text-right py-2">${Number(item.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${Number(invoice.amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({invoice.tax_rate}%):</span>
                      <span>${Number(invoice.tax_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${Number(invoice.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {invoice.payments && invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.payments.map((payment: any) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">${Number(payment.amount).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {payment.payment_method} • {payment.payment_reference}
                        </p>
                        {payment.processed_at && (
                          <p className="text-xs text-gray-500">{new Date(payment.processed_at).toLocaleDateString()}</p>
                        )}
                      </div>
                      <Badge
                        className={
                          payment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.clients ? (
                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{invoice.clients.name}</h4>
                    {invoice.clients.company && <p className="text-gray-600">{invoice.clients.company}</p>}
                  </div>
                  {invoice.clients.email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-900">{invoice.clients.email}</p>
                    </div>
                  )}
                  {invoice.clients.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-gray-900">{invoice.clients.phone}</p>
                    </div>
                  )}
                  {invoice.clients.address && (
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-gray-900">{invoice.clients.address}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No client information</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">${Number(invoice.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</span>
                </div>
                {invoice.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid On:</span>
                    <span className="font-medium">{new Date(invoice.paid_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <PaymentActions invoice={invoice} />
        </div>
      </div>
    </div>
  )
}
