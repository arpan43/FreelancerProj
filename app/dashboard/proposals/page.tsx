"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, FileText, Search } from "lucide-react"
import Link from "next/link"

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([])
  const [filteredProposals, setFilteredProposals] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProposals()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = proposals.filter(
        (proposal) =>
          proposal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proposal.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proposal.clients?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proposal.status?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredProposals(filtered)
    } else {
      setFilteredProposals(proposals)
    }
  }, [searchTerm, proposals])

  const fetchProposals = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("proposals")
        .select(`
          *,
          clients (
            name,
            company
          )
        `)
        .order("created_at", { ascending: false })

      setProposals(data || [])
      setFilteredProposals(data || [])
    } catch (error) {
      console.error("Error fetching proposals:", error)
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
            <p className="text-gray-600">Manage and track your project proposals</p>
          </div>
        </div>
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
          <p className="text-gray-600">Manage and track your project proposals</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard/proposals/new">
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search proposals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {!filteredProposals || filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No proposals found" : "No proposals yet"}
            </h3>
            <p className="text-gray-500 text-center mb-6">
              {searchTerm ? `No proposals match "${searchTerm}"` : "Get started by creating your first proposal"}
            </p>
            {!searchTerm && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard/proposals/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Proposal
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProposals.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{proposal.title}</CardTitle>
                    <CardDescription>
                      {proposal.clients?.name || proposal.clients?.company || "No client"}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(proposal.status)}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    {proposal.valid_until && (
                      <p className="text-sm text-gray-600">
                        Valid until: {new Date(proposal.valid_until).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Created: {new Date(proposal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ${Number(proposal.total_amount).toLocaleString()}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/proposals/${proposal.id}`}>View</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/proposals/${proposal.id}/edit`}>Edit</Link>
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
