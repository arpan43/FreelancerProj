import ClientForm from "@/components/client-form"

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add Client</h1>
        <p className="text-gray-600">Add a new client to your database</p>
      </div>

      <ClientForm />
    </div>
  )
}
