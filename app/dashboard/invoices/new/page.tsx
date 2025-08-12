import InvoiceForm from "@/components/invoice-form"

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
        <p className="text-gray-600">Fill out the details below to create a new invoice</p>
      </div>

      <InvoiceForm />
    </div>
  )
}
