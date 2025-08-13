import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, DollarSign, FileText, User, Building, Mail, Phone, MapPin, Edit } from "lucide-react"
import Link from "next/link"
import SendEmailDialog from "@/components/send-email-dialog"

interface ProposalPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { id } = await params
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Fetch proposal with related data
  const { data: proposal, error } = await supabase
    .from("proposals")
    .select(
      `
      *,
      clients (
        id,
        name,
        email,
        company,
        address,
        phone
      ),
      proposal_items (
        id,
        title,
        description,
        quantity,
        rate,
        amount
      )
    `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !proposal) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{proposal.title}</h1>
          <p className="text-muted-foreground">Created on {new Date(proposal.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(proposal.status)}>{proposal.status.toUpperCase()}</Badge>
          <SendEmailDialog
            type="proposal"
            itemId={proposal.id}
            defaultEmail={proposal.clients?.email}
            defaultName={proposal.clients?.name}
          />
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/proposals/${proposal.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Proposal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Proposal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(proposal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {proposal.valid_until && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Valid Until</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(proposal.valid_until).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {proposal.description && (
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">{proposal.description}</p>
                </div>
              )}

              {proposal.scope_of_work && (
                <div>
                  <p className="text-sm font-medium">Scope of Work</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{proposal.scope_of_work}</p>
                </div>
              )}

              {proposal.deliverables && (
                <div>
                  <p className="text-sm font-medium">Deliverables</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{proposal.deliverables}</p>
                </div>
              )}

              {proposal.timeline && (
                <div>
                  <p className="text-sm font-medium">Timeline</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{proposal.timeline}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proposal Items */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposal.proposal_items.map((item: any) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.rate)}
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.amount)}</p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total Project Cost</span>
                  <span>{formatCurrency(proposal.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {proposal.clients ? (
                <>
                  <div>
                    <p className="font-medium">{proposal.clients.name}</p>
                    {proposal.clients.company && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {proposal.clients.company}
                      </p>
                    )}
                  </div>
                  {proposal.clients.email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {proposal.clients.email}
                    </p>
                  )}
                  {proposal.clients.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {proposal.clients.phone}
                    </p>
                  )}
                  {proposal.clients.address && (
                    <p className="text-sm text-muted-foreground flex items-start gap-1">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      {proposal.clients.address}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No client information available</p>
              )}
            </CardContent>
          </Card>

          {/* Proposal Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Proposal Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Amount</span>
                <span className="text-sm font-medium">{formatCurrency(proposal.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Status</span>
                <Badge className={getStatusColor(proposal.status)} variant="secondary">
                  {proposal.status.toUpperCase()}
                </Badge>
              </div>
              {proposal.valid_until && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Valid for:</p>
                  <p className="text-sm font-medium">
                    {Math.ceil(
                      (new Date(proposal.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
