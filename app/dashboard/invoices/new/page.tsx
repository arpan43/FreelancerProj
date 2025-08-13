import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import InvoiceForm from "@/components/invoice-form"

export default async function NewInvoicePage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Invoice</h1>
        <p className="text-gray-600">Fill in the details below to create a new invoice</p>
      </div>

      <InvoiceForm />
    </div>
  )
}
