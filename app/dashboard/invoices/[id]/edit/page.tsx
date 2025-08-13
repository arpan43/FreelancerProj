import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import EditInvoiceForm from "@/components/edit-invoice-form"

interface EditInvoicePageProps {
  params: {
    id: string
  }
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const supabase = await createClient()

  // Fetch invoice data
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select(`
      *,
      invoice_items (
        id,
        description,
        quantity,
        rate,
        amount
      )
    `)
    .eq("id", params.id)
    .single()

  if (invoiceError || !invoice) {
    notFound()
  }

  // Fetch clients for the dropdown
  const { data: clients } = await supabase.from("clients").select("id, name, company").order("name")

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Invoice</h1>
          <p className="text-muted-foreground">Update invoice #{invoice.invoice_number}</p>
        </div>

        <EditInvoiceForm invoice={invoice} clients={clients || []} />
      </div>
    </div>
  )
}
