import EditClientForm from "@/components/edit-client-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  const { data: client, error } = await supabase.from("clients").select("*").eq("id", id).single()

  if (error || !client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Client</h1>
        <p className="text-gray-600">Update client information</p>
      </div>
      <EditClientForm client={client} />
    </div>
  )
}