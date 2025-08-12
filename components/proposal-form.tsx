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
import { useToast } from "@/hooks/use-toast"

interface ProposalItem {
  id: string
  title: string
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

export default function ProposalForm() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [scopeOfWork, setScopeOfWork] = useState("")
  const [deliverables, setDeliverables] = useState("")
  const [timeline, setTimeline] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [items, setItems] = useState<ProposalItem[]>([
    { id: "1", title: "", description: "", quantity: 1, rate: 0, amount: 0 },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadClients()
    // Set default valid until date (30 days from now)
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 30)
    setValidUntil(defaultDate.toISOString().split("T")[0])
  }, [])

  const loadClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("name")
    if (data) setClients(data)
  }

  const addItem = () => {
    const newItem: ProposalItem = {
      id: Date.now().toString(),
      title: "",
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

  const updateItem = (id: string, field: keyof ProposalItem, value: string | number) => {
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

  const total = items.reduce((sum, item) => sum + item.amount, 0)

  const saveProposal = async (status: "draft" | "sent") => {
    if (!selectedClientId || !title || items.some((item) => !item.title)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create proposal
      const { data: proposal, error: proposalError } = await supabase
        .from("proposals")
        .insert({
          client_id: selectedClientId,
          title,
          description,
          scope_of_work: scopeOfWork,
          deliverables,
          timeline,
          total_amount: total,
          status,
          valid_until: validUntil,
        })
        .select()
        .single()

      if (proposalError) throw proposalError

      // Create proposal items
      const proposalItems = items.map((item) => ({
        proposal_id: proposal.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      }))

      const { error: itemsError } = await supabase.from("proposal_items").insert(proposalItems)

      if (itemsError) throw itemsError

      toast({
        title: "Success",
        description: `Proposal ${status === "draft" ? "saved as draft" : "created and sent"}`,
      })

      router.push("/dashboard/proposals")
    } catch (error) {
      console.error("Error saving proposal:", error)
      toast({
        title: "Error",
        description: "Failed to save proposal",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proposal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Client *</label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.company && `(${client.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Valid Until</label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Project Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Website Redesign Project" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Project Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of the project..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Scope of Work</label>
            <Textarea
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              placeholder="Detailed description of what will be included in this project..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Deliverables</label>
            <Textarea
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="What the client will receive upon completion..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Timeline</label>
            <Textarea
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="Project timeline and key milestones..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Pricing Breakdown</CardTitle>
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
                <div className="col-span-3">
                  <label className="block text-sm font-medium mb-2">Service/Item *</label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateItem(item.id, "title", e.target.value)}
                    placeholder="Design Phase"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="UI/UX design and mockups"
                  />
                </div>
                <div className="col-span-1">
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
                <div className="col-span-1">
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
              <div className="w-64">
                <div className="flex justify-between font-bold text-xl">
                  <span>Total Project Cost:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button onClick={() => saveProposal("draft")} variant="outline" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button onClick={() => saveProposal("sent")} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          <Send className="h-4 w-4 mr-2" />
          Send Proposal
        </Button>
      </div>
    </div>
  )
}
