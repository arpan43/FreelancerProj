import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default async function ClientsPage() {
  const supabase = createClient()

  const { data: clients } = await supabase.from("clients").select("*").order("name")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your client information</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard/clients/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Link>
        </Button>
      </div>

      {!clients || clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
            <p className="text-gray-500 text-center mb-6">Add your first client to get started</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/clients/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{client.name}</CardTitle>
                {client.company && <CardDescription>{client.company}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {client.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {client.phone}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link href={`/dashboard/clients/${client.id}`}>View</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link href={`/dashboard/clients/${client.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
