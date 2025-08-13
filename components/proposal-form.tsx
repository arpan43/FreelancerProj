"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Save, Send, Sparkles, Loader2, Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

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

interface AIGenerationInputs {
  clientName: string
  projectTitle: string
  projectDescription: string
  estimatedAmount: string
  timeline: string
  validUntil: string
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
  const [activeTab, setActiveTab] = useState("manual")

  // AI Generation states
  const [aiInputs, setAiInputs] = useState<AIGenerationInputs>({
    clientName: "",
    projectTitle: "",
    projectDescription: "",
    estimatedAmount: "",
    timeline: "",
    validUntil: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadClients()
    // Set default valid until date (30 days from now)
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 30)
    const dateString = defaultDate.toISOString().split("T")[0]
    setValidUntil(dateString)
    setAiInputs((prev) => ({ ...prev, validUntil: dateString }))
  }, [])

  const loadClients = async () => {
    try {
      const { data, error } = await supabase.from("clients").select("*").order("name")
      if (error) {
        console.error("Error loading clients:", error)
        toast.error("Failed to load clients")
        return
      }
      if (data) setClients(data)
    } catch (error) {
      console.error("Error loading clients:", error)
      toast.error("Failed to load clients")
    }
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

  const generateAIProposal = async () => {
    if (!aiInputs.clientName || !aiInputs.projectTitle || !aiInputs.projectDescription || !aiInputs.estimatedAmount) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aiInputs),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to generate proposal")
      }

      if (data.error) {
        throw new Error(data.error)
      }

      // Populate the form with AI-generated content
      setTitle(aiInputs.projectTitle)
      setDescription(data.description || "")
      setScopeOfWork(data.scopeOfWork || "")
      setDeliverables(data.deliverables || "")
      setTimeline(data.timeline || aiInputs.timeline)
      setValidUntil(aiInputs.validUntil)

      // Set items if provided
      if (data.items && Array.isArray(data.items)) {
        const generatedItems = data.items.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          title: item.title || `Item ${index + 1}`,
          description: item.description || "",
          quantity: Number(item.quantity) || 1,
          rate: Number(item.rate) || 0,
          amount: (Number(item.quantity) || 1) * (Number(item.rate) || 0),
        }))
        setItems(generatedItems)
      }

      // Find and set client if exists
      const client = clients.find(
        (c) =>
          c.name.toLowerCase().includes(aiInputs.clientName.toLowerCase()) ||
          (c.company && c.company.toLowerCase().includes(aiInputs.clientName.toLowerCase())),
      )
      if (client) {
        setSelectedClientId(client.id)
      }

      // Switch to manual tab to review
      setActiveTab("manual")

      toast.success("AI proposal generated! Review and edit as needed.")
    } catch (error) {
      console.error("Error generating proposal:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate AI proposal. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const generateProposalPDF = () => {
    if (!title || items.length === 0 || items.some((item) => !item.title)) {
      toast.error("Please fill in the proposal details before generating PDF")
      return
    }

    try {
      const doc = new jsPDF()

      // Set font
      doc.setFont("helvetica")

      // Header
      doc.setFillColor(59, 130, 246) // Blue background
      doc.rect(0, 0, 210, 40, "F")

      // Company name
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("YOUR COMPANY", 20, 20)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Professional Services", 20, 28)
      doc.text("contact@yourcompany.com | (555) 123-4567", 20, 34)

      // Proposal title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("PROPOSAL", 150, 25)

      // Reset text color
      doc.setTextColor(0, 0, 0)

      // Proposal details
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Project Proposal", 20, 60)

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text(title, 20, 75)

      // Client information
      const selectedClient = clients.find((c) => c.id === selectedClientId)
      if (selectedClient) {
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("Prepared for:", 20, 90)

        doc.setFont("helvetica", "normal")
        doc.text(selectedClient.name, 20, 100)
        if (selectedClient.company) {
          doc.text(selectedClient.company, 20, 107)
        }
        if (selectedClient.email) {
          doc.text(selectedClient.email, 20, 114)
        }
      }

      // Date and validity
      doc.setFontSize(10)
      doc.text(`Proposal Date: ${new Date().toLocaleDateString()}`, 120, 90)
      doc.text(`Valid Until: ${new Date(validUntil).toLocaleDateString()}`, 120, 97)

      let yPosition = 130

      // Project Description
      if (description) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("Project Overview", 20, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        const descLines = doc.splitTextToSize(description, 170)
        doc.text(descLines, 20, yPosition)
        yPosition += descLines.length * 5 + 10
      }

      // Scope of Work
      if (scopeOfWork) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("Scope of Work", 20, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        const scopeLines = doc.splitTextToSize(scopeOfWork, 170)
        doc.text(scopeLines, 20, yPosition)
        yPosition += scopeLines.length * 5 + 10
      }

      // Deliverables
      if (deliverables) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("Deliverables", 20, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        const deliverableLines = doc.splitTextToSize(deliverables, 170)
        doc.text(deliverableLines, 20, yPosition)
        yPosition += deliverableLines.length * 5 + 15
      }

      // Check if we need a new page
      if (yPosition > 220) {
        doc.addPage()
        yPosition = 30
      }

      // Pricing table
      const tableData = items.map((item) => [
        item.title,
        item.description,
        item.quantity.toString(),
        `$${Number(item.rate).toFixed(2)}`,
        `$${Number(item.amount).toFixed(2)}`,
      ])

      autoTable(doc, {
        head: [["Service", "Description", "Qty", "Rate", "Amount"]],
        body: tableData,
        startY: yPosition,
        theme: "striped",
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 40, halign: "left" },
          1: { cellWidth: 60, halign: "left" },
          2: { cellWidth: 20, halign: "center" },
          3: { cellWidth: 30, halign: "right" },
          4: { cellWidth: 30, halign: "right" },
        },
        margin: { left: 20, right: 20 },
      })

      // Total
      const finalY = (doc as any).lastAutoTable.finalY + 15
      const total = items.reduce((sum, item) => sum + item.amount, 0)

      doc.setFillColor(249, 250, 251)
      doc.rect(120, finalY - 5, 70, 25, "F")

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Total Project Cost:", 125, finalY + 5)
      doc.text(`$${total.toFixed(2)}`, 185, finalY + 5, { align: "right" })

      // Timeline
      if (timeline) {
        const timelineY = finalY + 35
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("Timeline", 20, timelineY)

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        const timelineLines = doc.splitTextToSize(timeline, 170)
        doc.text(timelineLines, 20, timelineY + 10)
      }

      // Footer
      const pageHeight = doc.internal.pageSize.height
      doc.setFillColor(59, 130, 246)
      doc.rect(0, pageHeight - 20, 210, 20, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.text("Thank you for considering our proposal!", 20, pageHeight - 10)

      // Save the PDF
      const fileName = `proposal-${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`
      doc.save(fileName)

      toast.success("Proposal PDF downloaded successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF")
    }
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0)

  const saveProposal = async (status: "draft" | "sent") => {
    if (!selectedClientId || !title || items.some((item) => !item.title)) {
      toast.error("Please fill in all required fields")
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

      toast.success(`Proposal ${status === "draft" ? "saved as draft" : "created and sent"}`)

      router.push("/dashboard/proposals")
    } catch (error) {
      console.error("Error saving proposal:", error)
      toast.error("Failed to save proposal")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate
          </TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                AI Proposal Generator
              </CardTitle>
              <p className="text-sm text-gray-600">
                Provide basic project information and let AI generate a comprehensive proposal for you.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Client Name *</label>
                  <Input
                    value={aiInputs.clientName}
                    onChange={(e) => setAiInputs((prev) => ({ ...prev, clientName: e.target.value }))}
                    placeholder="John Smith / Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Budget *</label>
                  <Input
                    type="number"
                    value={aiInputs.estimatedAmount}
                    onChange={(e) => setAiInputs((prev) => ({ ...prev, estimatedAmount: e.target.value }))}
                    placeholder="5000"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project Title *</label>
                <Input
                  value={aiInputs.projectTitle}
                  onChange={(e) => setAiInputs((prev) => ({ ...prev, projectTitle: e.target.value }))}
                  placeholder="E-commerce Website Development"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project Description *</label>
                <Textarea
                  value={aiInputs.projectDescription}
                  onChange={(e) => setAiInputs((prev) => ({ ...prev, projectDescription: e.target.value }))}
                  placeholder="Brief description of what the client needs..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Timeline</label>
                  <Input
                    value={aiInputs.timeline}
                    onChange={(e) => setAiInputs((prev) => ({ ...prev, timeline: e.target.value }))}
                    placeholder="6-8 weeks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Valid Until</label>
                  <Input
                    type="date"
                    value={aiInputs.validUntil}
                    onChange={(e) => setAiInputs((prev) => ({ ...prev, validUntil: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={generateAIProposal}
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Proposal...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Proposal
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
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
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Website Redesign Project"
                />
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
                      <Button
                        onClick={() => removeItem(item.id)}
                        variant="outline"
                        size="sm"
                        disabled={items.length === 1}
                      >
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

          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <div className="flex gap-2">
              <Button onClick={() => saveProposal("draft")} variant="outline" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={generateProposalPDF}
                variant="outline"
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
            <Button onClick={() => saveProposal("sent")} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4 mr-2" />
              Send Proposal
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
