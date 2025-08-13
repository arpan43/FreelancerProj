import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Building, Calendar, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function ClientViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  const { data: client, error } = await supabase.from("clients").select("*").eq("id", id).single()

  if (error || !client) {
    notFound()
  }

  // Get invoices and proposals count for this client
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, total_amount, status")
    .eq("client_id", id)

  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, title, total_amount, status")
    .eq("client_id", id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            {client.company && <p className="text-gray-600">{client.company}</p>}
          </div>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href={`/dashboard/clients/${client.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Client
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                </div>
              )}
              {client.company && (
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium">{client.company}</p>
                  </div>
                </div>
              )}
              {client.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{client.address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Client Since</p>
                  <p className="font-medium">{new Date(client.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest invoices for this client</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices && invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-500">${invoice.total_amount?.toFixed(2) || "0.00"}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            invoice.status === "paid" ? "default" : invoice.status === "sent" ? "secondary" : "outline"
                          }
                        >
                          {invoice.status}
                        </Badge>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/invoices/${invoice.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No invoices yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Proposals */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Proposals</CardTitle>
              <CardDescription>Latest proposals for this client</CardDescription>
            </CardHeader>
            <CardContent>
              {proposals && proposals.length > 0 ? (
                <div className="space-y-3">
                  {proposals.slice(0, 5).map((proposal) => (
                    <div key={proposal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{proposal.title}</p>
                        <p className="text-sm text-gray-500">${proposal.total_amount?.toFixed(2) || "0.00"}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            proposal.status === "approved"
                              ? "default"
                              : proposal.status === "sent"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {proposal.status}
                        </Badge>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/proposals/${proposal.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No proposals yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href={`/dashboard/invoices/new?client=${client.id}`}>Create Invoice</Link>
              </Button>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href={`/dashboard/proposals/new?client=${client.id}`}>Create Proposal</Link>
              </Button>
              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href={`/dashboard/clients/${client.id}/edit`}>Edit Client</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Invoices</p>
                <p className="text-2xl font-bold">{invoices?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Proposals</p>
                <p className="text-2xl font-bold">{proposals?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">
                  $
                  {invoices
                    ?.filter((i) => i.status === "paid")
                    .reduce((sum, i) => sum + (i.total_amount || 0), 0)
                    .toFixed(2) || "0.00"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}