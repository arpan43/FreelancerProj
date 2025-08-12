import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Download, Send, Check, X, AlertCircle, Database } from "lucide-react"
import Link from "next/link"

interface ProposalPageProps {
  params: { id: string }
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const supabase = createClient()

  try {
    const { data: proposal, error } = await supabase
      .from("proposals")
      .select(`
        *,
        clients (
          name,
          company,
          email,
          phone,
          address
        ),
        proposal_items (
          title,
          description,
          quantity,
          rate,
          amount
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Database error:", error.message)

      // Check if it's a table not found error
      if (
        error.message.includes("does not exist") ||
        error.message.includes("table") ||
        error.message.includes("schema cache")
      ) {
        return (
          <div className="max-w-2xl mx-auto mt-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Database className="h-12 w-12 text-blue-500 mx-auto" />
                  <h2 className="text-xl font-semibold">Database Setup Required</h2>
                  <p className="text-gray-600">
                    The database tables haven't been created yet. Please run the setup scripts to initialize your
                    database.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg text-left">
                    <p className="text-sm font-medium mb-2">Run these scripts in order:</p>
                    <code className="text-xs bg-white p-2 rounded block mb-1">scripts/01-create-tables.sql</code>
                    <code className="text-xs bg-white p-2 rounded block">scripts/02-add-payment-tables.sql</code>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button asChild variant="outline">
                      <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/dashboard/proposals">View Proposals</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      // For other database errors
      return (
        <div className="max-w-2xl mx-auto mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <h2 className="text-xl font-semibold">Database Connection Error</h2>
                <p className="text-gray-600">
                  Unable to connect to the database. Please check your connection and try again.
                </p>
                <Button asChild variant="outline">
                  <Link href="/dashboard/proposals">Back to Proposals</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (!proposal) {
      notFound()
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case "approved":
          return "bg-green-100 text-green-800"
        case "sent":
          return "bg-blue-100 text-blue-800"
        case "rejected":
          return "bg-red-100 text-red-800"
        case "expired":
          return "bg-orange-100 text-orange-800"
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
            <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
            <p className="text-gray-600">Created on {new Date(proposal.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={getStatusColor(proposal.status)}>
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </Badge>
            <div className="flex space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/proposals/${proposal.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              {proposal.status === "draft" && (
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
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {proposal.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{proposal.description}</p>
                  </div>
                )}
                {proposal.scope_of_work && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Scope of Work</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{proposal.scope_of_work}</p>
                  </div>
                )}
                {proposal.deliverables && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Deliverables</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{proposal.deliverables}</p>
                  </div>
                )}
                {proposal.timeline && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{proposal.timeline}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Service/Item</th>
                        <th className="text-left py-2">Description</th>
                        <th className="text-right py-2">Qty</th>
                        <th className="text-right py-2">Rate</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposal.proposal_items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 font-medium">{item.title}</td>
                          <td className="py-2 text-gray-600">{item.description}</td>
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
                    <div className="w-64">
                      <div className="flex justify-between font-bold text-xl">
                        <span>Total Project Cost:</span>
                        <span>${Number(proposal.total_amount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                {proposal.clients ? (
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{proposal.clients.name}</h4>
                      {proposal.clients.company && <p className="text-gray-600">{proposal.clients.company}</p>}
                    </div>
                    {proposal.clients.email && (
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-gray-900">{proposal.clients.email}</p>
                      </div>
                    )}
                    {proposal.clients.phone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-gray-900">{proposal.clients.phone}</p>
                      </div>
                    )}
                    {proposal.clients.address && (
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="text-gray-900">{proposal.clients.address}</p>
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
                <CardTitle>Proposal Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">${Number(proposal.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={getStatusColor(proposal.status)}>
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </Badge>
                  </div>
                  {proposal.valid_until && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valid Until:</span>
                      <span className="font-medium">{new Date(proposal.valid_until).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {proposal.status === "sent" && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Approved
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <X className="h-4 w-4 mr-2" />
                      Mark as Rejected
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error:", error)
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold">Something went wrong</h2>
              <p className="text-gray-600">An unexpected error occurred. Please try again later.</p>
              <Button asChild variant="outline">
                <Link href="/dashboard/proposals">Back to Proposals</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
