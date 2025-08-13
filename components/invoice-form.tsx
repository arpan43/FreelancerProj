"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

interface Client {
  id: string
  name: string
  company: string
  email: string
}

export default function InvoiceForm() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [notes, setNotes] = useState("")
  const [taxRate, setTaxRate] = useState(0)
  const [items, setItems] = useState<InvoiceItem[]>([{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [databaseReady, setDatabaseReady] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsInitialLoading(true)
    try {
      await Promise.all([loadClients(), generateInvoiceNumber()])
      setDatabaseReady(true)
    } catch (error) {
      console.error("Error loading initial data:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes("table") && errorMessage.includes("not found")) {
        setDatabaseReady(false)
        toast.error("Database Setup Required", {
          description: "Please run the database setup scripts to create the required tables.",
        })
      } else {
        toast.error("Database Connection Error", {
          description: "There was an issue connecting to the database. Please try again.",
        })
      }
      setInvoiceNumber("INV-0001")
    } finally {
      setIsInitialLoading(false)
    }
  }

  const loadClients = async () => {
    try {
      const { data, error } = await supabase.from("clients").select("*").order("name")
      if (error) {
        if (error.message.includes("table") && error.message.includes("not found")) {
          throw new Error("Database tables not found. Please run the setup scripts.")
        }
        console.error("Error loading clients:", error)
        return
      }
      if (data) setClients(data)
    } catch (error) {
      console.error("Error loading clients:", error)
      throw error
    }
  }

  const generateInvoiceNumber = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("invoice_number")
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) {
        if (error.message.includes("table") && error.message.includes("not found")) {
          throw new Error("Database tables not found. Please run the setup scripts.")
        }
        console.error("Error generating invoice number:", error)
        setInvoiceNumber("INV-0001")
        return
      }

      const lastNumber = data?.[0]?.invoice_number
      const nextNumber = lastNumber ? Number.parseInt(lastNumber.replace(/\D/g, "")) + 1 : 1
      setInvoiceNumber(`INV-${nextNumber.toString().padStart(4, "0")}`)
    } catch (error) {
      console.error("Error generating invoice number:", error)
      setInvoiceNumber("INV-0001")
      throw error
    }
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  const saveInvoice = async (status: "draft" | "sent") => {
    if (!databaseReady) {
      toast.error("Database Setup Required", {
        description: "Please run the database setup scripts before creating invoices.",
      })
      return
    }

    if (!selectedClientId || !title || items.some((item) => !item.description)) {
      toast.error("Error", {
        description: "Please fill in all required fields",
      })
      return
    }

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Authentication Error", {
          description: "Please log in to create invoices.",
        })
        return
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: user.id,
          client_id: selectedClientId,
          invoice_number: invoiceNumber,
          title,
          description,
          amount: subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total_amount: total,
          status,
          issue_date: issueDate,
          due_date: dueDate,
          payment_terms: paymentTerms,
          notes,
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      const invoiceItems = items.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      }))

      const { error: itemsError } = await supabase.from("invoice_items").insert(invoiceItems)

      if (itemsError) throw itemsError

      toast.success("Success", {
        description: `Invoice ${status === "draft" ? "saved as draft" : "created and sent"}`,
      })

      router.push("/dashboard/invoices")
    } catch (error) {
      console.error("Error saving invoice:", error)
      toast.error("Error", {
        description: "Failed to save invoice. Please ensure database tables are set up.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitialLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading invoice form...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!databaseReady) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-yellow-600">
                <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Database Setup Required</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                The database tables haven't been created yet. Please run the setup scripts to create the required tables
                for invoices, clients, and other data.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Run these scripts in order:</p>
                <div className="bg-gray-100 p-3 rounded-md text-left">
                  <code className="text-sm">
                    1. scripts/01-create-tables.sql
                    <br />
                    2. scripts/02-add-payment-tables.sql
                  </code>
                </div>
              </div>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Refresh After Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Client *</label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={clients.length === 0 ? "No clients found - add clients first" : "Select a client"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.company && `(${client.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clients.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No clients found.{" "}
                  <a href="/dashboard/clients/new" className="text-blue-600 hover:underline">
                    Add a client first
                  </a>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Invoice Number</label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-0001" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Web Development Services" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Issue Date</label>
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the work performed..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Terms</label>
            <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="Net 30 days" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invoice Items</CardTitle>
            <Button onClick={addItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-5">
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="Service or product description"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Qty</label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Rate</label>
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <Input value={`$${item.amount.toFixed(2)}`} readOnly className="bg-gray-50" />
                </div>
                <div className="col-span-1">
                  <Button onClick={() => removeItem(item.id)} variant="outline" size="sm" disabled={items.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes or terms..."
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button onClick={() => saveInvoice("draft")} variant="outline" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button onClick={() => saveInvoice("sent")} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          <Send className="h-4 w-4 mr-2" />
          Create & Send Invoice
        </Button>
      </div>
    </div>
  )
}
