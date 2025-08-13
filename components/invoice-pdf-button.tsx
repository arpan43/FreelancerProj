"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Download, ChevronDown, Palette, Settings, Eye, Save, FolderOpen, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface InvoiceItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

interface Invoice {
  id: string
  invoice_number: string
  client_name: string
  client_email: string
  client_address?: string
  issue_date: string
  due_date: string
  status: string
  total_amount: number
  invoice_items: InvoiceItem[]
  notes?: string
}

interface InvoicePDFButtonProps {
  invoice: Invoice
  template?: "modern" | "classic" | "minimal" | "corporate"
  primaryColor?: string
  accentColor?: string
  fontFamily?: string
}

type PDFTemplate = "modern" | "classic" | "minimal" | "corporate"

interface TemplateCustomization {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  font: string
  fontSize: number
}

interface SavedTemplate {
  id: string
  name: string
  baseTemplate: PDFTemplate
  customization: TemplateCustomization
  createdAt: string
  updatedAt: string
}

const defaultCustomizations: Record<PDFTemplate, TemplateCustomization> = {
  modern: {
    primaryColor: "#3B82F6", // Blue
    secondaryColor: "#475569", // Slate
    accentColor: "#EF4444", // Red
    textColor: "#1F2937", // Gray-800
    font: "helvetica",
    fontSize: 10,
  },
  classic: {
    primaryColor: "#8B4513", // Brown
    secondaryColor: "#D3D3D3", // Light gray
    accentColor: "#DAA520", // Goldenrod
    textColor: "#000000", // Black
    font: "times",
    fontSize: 11,
  },
  minimal: {
    primaryColor: "#000000", // Black
    secondaryColor: "#6B7280", // Gray
    accentColor: "#374151", // Dark gray
    textColor: "#000000", // Black
    font: "helvetica",
    fontSize: 10,
  },
  corporate: {
    primaryColor: "#1E3A8A", // Navy
    secondaryColor: "#F8FAFC", // Very light gray
    accentColor: "#FFD700", // Gold
    textColor: "#1F2937", // Dark gray
    font: "helvetica",
    fontSize: 10,
  },
}

const TemplatePreview = ({
  template,
  customization,
  invoice,
}: { template: PDFTemplate; customization: TemplateCustomization; invoice: any }) => {
  const getFontFamily = (font: string) => {
    switch (font) {
      case "times":
        return "Times, serif"
      case "courier":
        return "Courier, monospace"
      default:
        return "Helvetica, Arial, sans-serif"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#22C55E"
      case "sent":
        return customization.primaryColor
      case "overdue":
        return customization.accentColor
      default:
        return customization.secondaryColor
    }
  }

  if (template === "modern") {
    return (
      <div
        className="w-full max-w-2xl mx-auto bg-white border rounded-lg overflow-hidden shadow-sm"
        style={{ fontFamily: getFontFamily(customization.font) }}
      >
        {/* Header */}
        <div
          className="h-16 flex items-center justify-between px-6"
          style={{ backgroundColor: customization.primaryColor }}
        >
          <div>
            <h1 className="text-white text-lg font-bold">YOUR COMPANY</h1>
            <p className="text-white text-xs opacity-90">Professional Services</p>
          </div>
          <div className="text-white text-xl font-bold">INVOICE</div>
        </div>

        <div className="p-6 space-y-4">
          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded p-3" style={{ borderColor: customization.secondaryColor }}>
              <h3 className="font-bold text-sm mb-2" style={{ color: customization.textColor }}>
                Invoice Details
              </h3>
              <div className="space-y-1 text-xs" style={{ color: customization.textColor }}>
                <p>Invoice #: {invoice.invoice_number}</p>
                <p>Issue Date: {new Date(invoice.issue_date).toLocaleDateString()}</p>
                <p>Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="px-2 py-1 rounded text-white text-xs font-bold"
                    style={{ backgroundColor: getStatusColor(invoice.status) }}
                  >
                    {invoice.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="border rounded p-3" style={{ borderColor: customization.secondaryColor }}>
              <h3 className="font-bold text-sm mb-2" style={{ color: customization.textColor }}>
                Bill To:
              </h3>
              {invoice.clients && (
                <div className="space-y-1 text-xs" style={{ color: customization.textColor }}>
                  <p className="font-bold">{invoice.clients.name}</p>
                  {invoice.clients.company && <p>{invoice.clients.company}</p>}
                  {invoice.clients.email && <p>{invoice.clients.email}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Project Title */}
          {invoice.title && (
            <div>
              <h3 className="font-bold text-sm" style={{ color: customization.textColor }}>
                Project: {invoice.title}
              </h3>
            </div>
          )}

          {/* Items Table */}
          <div className="border rounded overflow-hidden" style={{ borderColor: customization.secondaryColor }}>
            <div
              className="grid grid-cols-4 gap-2 p-2 text-white text-xs font-bold"
              style={{ backgroundColor: customization.primaryColor }}
            >
              <div>Description</div>
              <div className="text-center">Qty</div>
              <div className="text-right">Rate</div>
              <div className="text-right">Amount</div>
            </div>
            {invoice.invoice_items.slice(0, 2).map((item: any, index: number) => (
              <div
                key={index}
                className={`grid grid-cols-4 gap-2 p-2 text-xs ${index % 2 === 1 ? "bg-gray-50" : ""}`}
                style={{ color: customization.textColor }}
              >
                <div>{item.description}</div>
                <div className="text-center">{item.quantity}</div>
                <div className="text-right">${Number(item.rate).toFixed(2)}</div>
                <div className="text-right">${Number(item.amount).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-48 bg-gray-50 p-3 rounded">
              <div className="space-y-1 text-xs" style={{ color: customization.textColor }}>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${Number(invoice.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({invoice.tax_rate}%):</span>
                  <span>${Number(invoice.tax_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Total:</span>
                  <span>${Number(invoice.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center p-3 text-white text-xs" style={{ backgroundColor: customization.primaryColor }}>
            Thank you for your business!
          </div>
        </div>
      </div>
    )
  }

  if (template === "classic") {
    return (
      <div
        className="w-full max-w-2xl mx-auto bg-white border rounded-lg overflow-hidden shadow-sm"
        style={{ fontFamily: getFontFamily(customization.font) }}
      >
        {/* Header */}
        <div className="text-center py-6 border-b-2" style={{ borderColor: customization.primaryColor }}>
          <h1 className="text-xl font-bold mb-2" style={{ color: customization.primaryColor }}>
            YOUR COMPANY NAME
          </h1>
          <p className="text-sm" style={{ color: customization.textColor }}>
            123 Business Street, City, State 12345
          </p>
          <p className="text-sm" style={{ color: customization.textColor }}>
            Phone: (555) 123-4567 | Email: contact@company.com
          </p>
        </div>

        <div className="text-center py-4">
          <h2 className="text-2xl font-bold" style={{ color: customization.textColor }}>
            INVOICE
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-bold" style={{ color: customization.textColor }}>
                  Invoice Number:
                </span>
                <span style={{ color: customization.textColor }}>{invoice.invoice_number}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-bold" style={{ color: customization.textColor }}>
                  Issue Date:
                </span>
                <span style={{ color: customization.textColor }}>
                  {new Date(invoice.issue_date).toLocaleDateString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-bold" style={{ color: customization.textColor }}>
                  Due Date:
                </span>
                <span style={{ color: customization.textColor }}>
                  {new Date(invoice.due_date).toLocaleDateString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-bold" style={{ color: customization.textColor }}>
                  Status:
                </span>
                <span style={{ color: customization.textColor }}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-2" style={{ color: customization.textColor }}>
                Bill To:
              </h3>
              {invoice.clients && (
                <div className="space-y-1 text-sm" style={{ color: customization.textColor }}>
                  <p>{invoice.clients.name}</p>
                  {invoice.clients.company && <p>{invoice.clients.company}</p>}
                  {invoice.clients.email && <p>{invoice.clients.email}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Project Title */}
          {invoice.title && (
            <div>
              <h3 className="font-bold text-sm" style={{ color: customization.textColor }}>
                Project: {invoice.title}
              </h3>
            </div>
          )}

          {/* Items Table */}
          <div className="border-2 border-gray-300">
            <div
              className="grid grid-cols-4 gap-2 p-2 text-xs font-bold border-b"
              style={{ backgroundColor: customization.secondaryColor, color: customization.textColor }}
            >
              <div>Description</div>
              <div className="text-center">Quantity</div>
              <div className="text-right">Rate</div>
              <div className="text-right">Amount</div>
            </div>
            {invoice.invoice_items.slice(0, 2).map((item: any, index: number) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-2 p-2 text-xs border-b"
                style={{ color: customization.textColor }}
              >
                <div>{item.description}</div>
                <div className="text-center">{item.quantity}</div>
                <div className="text-right">${Number(item.rate).toFixed(2)}</div>
                <div className="text-right">${Number(item.amount).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-48 border-2 border-gray-300 p-3">
              <div className="space-y-1 text-sm" style={{ color: customization.textColor }}>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${Number(invoice.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({invoice.tax_rate}%):</span>
                  <span>${Number(invoice.tax_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t-2 border-gray-300 pt-1">
                  <span>TOTAL:</span>
                  <span>${Number(invoice.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t pt-4 text-sm italic" style={{ color: customization.textColor }}>
            Thank you for your business. Payment terms: Net 30 days.
          </div>
        </div>
      </div>
    )
  }

  if (template === "minimal") {
    return (
      <div
        className="w-full max-w-2xl mx-auto bg-white border rounded-lg overflow-hidden shadow-sm"
        style={{ fontFamily: getFontFamily(customization.font) }}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg font-normal" style={{ color: customization.textColor }}>
                Invoice
              </h1>
              <p className="text-sm" style={{ color: customization.textColor }}>
                #{invoice.invoice_number}
              </p>
              <div className="mt-2 space-y-1 text-xs" style={{ color: customization.secondaryColor }}>
                <p>Issued: {new Date(invoice.issue_date).toLocaleDateString()}</p>
                <p>Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
              <p className="text-xs mt-1" style={{ color: customization.textColor }}>
                Status: {invoice.status}
              </p>
            </div>
          </div>

          {/* From/To */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-sm mb-2" style={{ color: customization.textColor }}>
                From:
              </h3>
              <div className="text-xs space-y-1" style={{ color: customization.textColor }}>
                <p>Your Company</p>
                <p>contact@company.com</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-2" style={{ color: customization.textColor }}>
                To:
              </h3>
              {invoice.clients && (
                <div className="text-xs space-y-1" style={{ color: customization.textColor }}>
                  <p>{invoice.clients.name}</p>
                  {invoice.clients.company && <p>{invoice.clients.company}</p>}
                  {invoice.clients.email && <p>{invoice.clients.email}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Project */}
          {invoice.title && (
            <div>
              <h3 className="font-bold text-sm" style={{ color: customization.textColor }}>
                Project:
              </h3>
              <p className="text-sm" style={{ color: customization.textColor }}>
                {invoice.title}
              </p>
            </div>
          )}

          {/* Items Table */}
          <div>
            <div
              className="grid grid-cols-4 gap-2 pb-2 border-b text-xs font-bold"
              style={{ color: customization.textColor, borderColor: customization.textColor }}
            >
              <div>Item</div>
              <div className="text-center">Qty</div>
              <div className="text-right">Rate</div>
              <div className="text-right">Amount</div>
            </div>
            {invoice.invoice_items.slice(0, 2).map((item: any, index: number) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-2 py-2 text-xs"
                style={{ color: customization.textColor }}
              >
                <div>{item.description}</div>
                <div className="text-center">{item.quantity}</div>
                <div className="text-right">${Number(item.rate).toFixed(2)}</div>
                <div className="text-right">${Number(item.amount).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-48 space-y-1 text-xs">
              <div className="flex justify-between" style={{ color: customization.textColor }}>
                <span>Subtotal</span>
                <span>${Number(invoice.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between" style={{ color: customization.textColor }}>
                <span>Tax ({invoice.tax_rate}%)</span>
                <span>${Number(invoice.tax_amount).toFixed(2)}</span>
              </div>
              <div
                className="flex justify-between font-bold border-t pt-1"
                style={{ color: customization.textColor, borderColor: customization.textColor }}
              >
                <span>Total</span>
                <span>${Number(invoice.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (template === "corporate") {
    return (
      <div
        className="w-full max-w-2xl mx-auto bg-white border rounded-lg overflow-hidden shadow-sm"
        style={{ fontFamily: getFontFamily(customization.font) }}
      >
        {/* Header */}
        <div className="relative">
          <div
            className="h-20 flex items-center justify-between px-6"
            style={{ backgroundColor: customization.primaryColor }}
          >
            <div>
              <h1 className="text-white text-xl font-bold">CORPORATE SOLUTIONS</h1>
              <p className="text-white text-xs opacity-90">Professional Business Services</p>
              <p className="text-white text-xs opacity-90">1234 Corporate Blvd, Suite 100, Business City, BC 12345</p>
            </div>
          </div>
          <div
            className="absolute top-4 right-6 px-4 py-2 rounded text-sm font-bold"
            style={{ backgroundColor: customization.accentColor, color: customization.primaryColor }}
          >
            INVOICE
          </div>
          <div className="h-1" style={{ backgroundColor: customization.accentColor }}></div>
        </div>

        <div className="p-6 space-y-4">
          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded" style={{ backgroundColor: customization.secondaryColor }}>
              <h3 className="font-bold text-sm mb-2" style={{ color: customization.primaryColor }}>
                INVOICE DETAILS
              </h3>
              <div className="space-y-1 text-xs" style={{ color: customization.textColor }}>
                <p>Invoice Number: {invoice.invoice_number}</p>
                <p>Issue Date: {new Date(invoice.issue_date).toLocaleDateString()}</p>
                <p>Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
                <p className="font-bold">Status: {invoice.status.toUpperCase()}</p>
              </div>
            </div>

            <div className="p-3 rounded" style={{ backgroundColor: customization.secondaryColor }}>
              <h3 className="font-bold text-sm mb-2" style={{ color: customization.primaryColor }}>
                BILL TO
              </h3>
              {invoice.clients && (
                <div className="space-y-1 text-xs" style={{ color: customization.textColor }}>
                  <p className="font-bold">{invoice.clients.name}</p>
                  {invoice.clients.company && <p>{invoice.clients.company}</p>}
                  {invoice.clients.email && <p>{invoice.clients.email}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Project Title */}
          {invoice.title && (
            <div>
              <h3 className="font-bold text-sm" style={{ color: customization.primaryColor }}>
                PROJECT DETAILS
              </h3>
              <p className="text-sm" style={{ color: customization.textColor }}>
                {invoice.title}
              </p>
            </div>
          )}

          {/* Items Table */}
          <div className="border rounded overflow-hidden" style={{ borderColor: customization.secondaryColor }}>
            <div
              className="grid grid-cols-4 gap-2 p-2 text-white text-xs font-bold"
              style={{ backgroundColor: customization.primaryColor }}
            >
              <div>DESCRIPTION</div>
              <div className="text-center">QTY</div>
              <div className="text-right">RATE</div>
              <div className="text-right">AMOUNT</div>
            </div>
            {invoice.invoice_items.slice(0, 2).map((item: any, index: number) => (
              <div
                key={index}
                className={`grid grid-cols-4 gap-2 p-2 text-xs ${index % 2 === 1 ? "" : ""}`}
                style={{
                  color: customization.textColor,
                  backgroundColor: index % 2 === 1 ? customization.secondaryColor : "white",
                }}
              >
                <div>{item.description}</div>
                <div className="text-center">{item.quantity}</div>
                <div className="text-right">${Number(item.rate).toFixed(2)}</div>
                <div className="text-right">${Number(item.amount).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-48 relative">
              <div className="h-1 rounded-t" style={{ backgroundColor: customization.accentColor }}></div>
              <div className="p-3 rounded-b" style={{ backgroundColor: customization.secondaryColor }}>
                <div className="space-y-1 text-xs" style={{ color: customization.textColor }}>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${Number(invoice.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({invoice.tax_rate}%):</span>
                    <span>${Number(invoice.tax_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm" style={{ color: customization.primaryColor }}>
                    <span>TOTAL AMOUNT:</span>
                    <span>${Number(invoice.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative">
            <div className="h-1" style={{ backgroundColor: customization.accentColor }}></div>
            <div className="p-3 text-white text-xs" style={{ backgroundColor: customization.primaryColor }}>
              <p>CORPORATE SOLUTIONS - Professional Business Services</p>
              <p>Thank you for choosing our professional services.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

interface Color {
  0: number
  1: number
  2: number
}

function hexToRgb(hex: string): Color {
  // Remove the hash if it exists
  hex = hex.replace("#", "")

  // Parse r, g, b values
  const r = Number.parseInt(hex.substring(0, 2), 16)
  const g = Number.parseInt(hex.substring(2, 4), 16)
  const b = Number.parseInt(hex.substring(4, 6), 16)

  return { 0: r, 1: g, 2: b } as Color
}

export default function InvoicePDFButton({
  invoice,
  template = "modern",
  primaryColor = "#2563eb",
  accentColor = "#3b82f6",
  fontFamily = "helvetica",
}: InvoicePDFButtonProps) {
  const [customizations, setCustomizations] =
    useState<Record<PDFTemplate, TemplateCustomization>>(defaultCustomizations)
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([])
  const [showCustomization, setShowCustomization] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate>("modern")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [showLoadDialog, setShowLoadDialog] = useState(false)

  useEffect(() => {
    // Load saved templates from local storage on component mount
    const storedTemplates = localStorage.getItem("savedTemplates")
    if (storedTemplates) {
      setSavedTemplates(JSON.parse(storedTemplates))
    }
  }, [])

  useEffect(() => {
    // Save templates to local storage whenever savedTemplates changes
    localStorage.setItem("savedTemplates", JSON.stringify(savedTemplates))
  }, [savedTemplates])

  const updateCustomization = (template: PDFTemplate, key: keyof TemplateCustomization, value: string | number) => {
    setCustomizations((prev) => ({
      ...prev,
      [template]: {
        ...prev[template],
        [key]: value,
      },
    }))
  }

  const generatePDF = (template: PDFTemplate) => {
    const customization = customizations[template]

    switch (template) {
      case "modern":
        generateModernPDF(customization)
        break
      case "classic":
        generateClassicPDF(customization)
        break
      case "minimal":
        generateMinimalPDF(customization)
        break
      case "corporate":
        generateCorporatePDF(customization)
        break
      default:
        generateModernPDF(customization)
    }
  }

  const generateModernPDF = (customization: TemplateCustomization) => {
    const doc = new jsPDF()

    // Set font
    doc.setFont(customization.font)

    // Define colors from customization
    const primaryColor = hexToRgb(customization.primaryColor)
    const secondaryColor = hexToRgb(customization.secondaryColor)
    const textColor = hexToRgb(customization.textColor)
    const accentColor = hexToRgb(customization.accentColor)

    // Add header background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, 210, 50, "F")

    // Company name/logo area
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont(customization.font, "bold")
    doc.text("YOUR COMPANY", 20, 25)

    doc.setFontSize(customization.fontSize)
    doc.setFont(customization.font, "normal")
    doc.text("Professional Services", 20, 35)
    doc.text("contact@yourcompany.com | (555) 123-4567", 20, 42)

    // Invoice title
    doc.setFontSize(28)
    doc.setFont(customization.font, "bold")
    doc.text("INVOICE", 150, 30)

    // Reset text color for body
    doc.setTextColor(textColor[0], textColor[1], textColor[2])

    // Invoice details box
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.setLineWidth(0.5)
    doc.rect(20, 60, 85, 45)
    doc.rect(115, 60, 75, 45)

    // Invoice information
    doc.setFontSize(customization.fontSize + 2)
    doc.setFont(customization.font, "bold")
    doc.text("Invoice Details", 25, 70)

    doc.setFont(customization.font, "normal")
    doc.setFontSize(customization.fontSize)
    doc.text(`Invoice #: ${invoice.invoice_number}`, 25, 80)
    doc.text(
      `Issue Date: ${new Date(invoice.issue_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      25,
      87,
    )
    doc.text(
      `Due Date: ${new Date(invoice.due_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      25,
      94,
    )

    // Status badge
    const statusColors = {
      draft: secondaryColor,
      sent: primaryColor,
      paid: [34, 197, 94],
      overdue: accentColor,
    }
    const statusColor = statusColors[invoice.status as keyof typeof statusColors] || secondaryColor

    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
    doc.roundedRect(25, 97, 25, 6, 2, 2, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont(customization.font, "bold")
    doc.text(invoice.status.toUpperCase(), 27, 101)

    // Reset text color
    doc.setTextColor(textColor[0], textColor[1], textColor[2])

    // Bill To section
    doc.setFontSize(customization.fontSize + 2)
    doc.setFont(customization.font, "bold")
    doc.text("Bill To:", 120, 70)

    if (invoice.clients) {
      doc.setFont(customization.font, "normal")
      doc.setFontSize(customization.fontSize)
      let yPos = 80

      doc.setFont(customization.font, "bold")
      doc.text(invoice.clients.name, 120, yPos)
      yPos += 7

      doc.setFont(customization.font, "normal")
      if (invoice.clients.company) {
        doc.text(invoice.clients.company, 120, yPos)
        yPos += 7
      }
      if (invoice.clients.email) {
        doc.text(invoice.clients.email, 120, yPos)
        yPos += 7
      }
      if (invoice.clients.address) {
        const addressLines = doc.splitTextToSize(invoice.clients.address, 65)
        doc.text(addressLines, 120, yPos)
      }
    }

    // Project title
    if (invoice.title) {
      doc.setFontSize(customization.fontSize + 4)
      doc.setFont(customization.font, "bold")
      doc.text("Project: " + invoice.title, 20, 125)
    }

    // Items table
    const tableData = invoice.invoice_items.map((item: any) => [
      item.description,
      item.quantity.toString(),
      `$${Number(item.rate).toFixed(2)}`,
      `$${Number(item.amount).toFixed(2)}`,
    ])

    autoTable(doc, {
      head: [["Description", "Qty", "Rate", "Amount"]],
      body: tableData,
      startY: 140,
      theme: "striped",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: customization.fontSize + 1,
        fontStyle: "bold",
        halign: "center",
        font: customization.font,
      },
      bodyStyles: {
        fontSize: customization.fontSize,
        textColor: textColor,
        font: customization.font,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 85, halign: "left" },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 20, right: 20 },
      showHead: "everyPage",
      pageBreak: "auto",
      tableWidth: "auto",
      styles: {
        overflow: "linebreak",
        cellWidth: "wrap",
      },
      tableWidth: 160,
    })

    // Get final Y position after table and add proper spacing
    const finalY = (doc as any).lastAutoTable.finalY + 15

    // Check if we need a new page for totals
    const pageHeight = doc.internal.pageSize.height
    let totalsStartY = finalY

    if (finalY > pageHeight - 80) {
      doc.addPage()
      totalsStartY = 30 // Start totals at top of new page
    }

    // Totals section with background
    doc.setFillColor(249, 250, 251)
    doc.rect(120, totalsStartY - 5, 70, 45, "F")

    // Subtotal
    doc.setFontSize(customization.fontSize + 1)
    doc.setFont(customization.font, "normal")
    doc.text("Subtotal:", 125, totalsStartY + 5)
    doc.text(`$${Number(invoice.amount).toFixed(2)}`, 180, totalsStartY + 5, { align: "right" })

    // Tax
    if (invoice.tax_rate > 0) {
      doc.text(`Tax (${invoice.tax_rate}%):`, 125, totalsStartY + 15)
      doc.text(`$${Number(invoice.tax_amount).toFixed(2)}`, 180, totalsStartY + 15, { align: "right" })
    }

    // Total line
    doc.setLineWidth(0.5)
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.line(125, totalsStartY + 20, 185, totalsStartY + 20)

    // Total amount
    doc.setFontSize(customization.fontSize + 4)
    doc.setFont(customization.font, "bold")
    doc.text("Total:", 125, totalsStartY + 30)
    doc.text(`$${Number(invoice.total_amount).toFixed(2)}`, 180, totalsStartY + 30, { align: "right" })

    // Payment terms section
    const termsY = totalsStartY + 50
    doc.setFontSize(customization.fontSize + 2)
    doc.setFont(customization.font, "bold")
    doc.text("Payment Terms", 20, termsY)

    doc.setFontSize(customization.fontSize)
    doc.setFont(customization.font, "normal")
    const paymentTerms = [
      "• Payment is due within 30 days of invoice date",
      "• Late payments may incur a 1.5% monthly service charge",
      "• Please include invoice number with payment",
      "• Contact us for any billing questions",
    ]

    paymentTerms.forEach((term, index) => {
      doc.text(term, 20, termsY + 10 + index * 7)
    })

    // Notes section
    if (invoice.notes) {
      const notesY = termsY + 45
      doc.setFontSize(customization.fontSize + 2)
      doc.setFont(customization.font, "bold")
      doc.text("Notes", 20, notesY)

      doc.setFontSize(customization.fontSize)
      doc.setFont(customization.font, "normal")
      const splitNotes = doc.splitTextToSize(invoice.notes, 170)
      doc.text(splitNotes, 20, notesY + 10)
    }

    // Footer
    const currentPageHeight = doc.internal.pageSize.height
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, currentPageHeight - 25, 210, 25, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont(customization.font, "normal")
    doc.text("Thank you for your business!", 20, currentPageHeight - 15)
    doc.text("This invoice was generated electronically and is valid without signature.", 20, currentPageHeight - 8)

    // Page number
    doc.text("Page 1 of 1", 180, currentPageHeight - 8, { align: "right" })

    // Save the PDF
    doc.save(`invoice-${invoice.invoice_number}-modern-custom.pdf`)
  }

  const generateClassicPDF = (customization: TemplateCustomization) => {
    const doc = new jsPDF()

    // Set font
    doc.setFont(customization.font)

    // Classic colors from customization
    const primaryColor = hexToRgb(customization.primaryColor)
    const textColor = hexToRgb(customization.textColor)
    const secondaryColor = hexToRgb(customization.secondaryColor)
    const accentColor = hexToRgb(customization.accentColor)

    // Header with classic styling
    doc.setFontSize(20)
    doc.setFont(customization.font, "bold")
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text("YOUR COMPANY NAME", 105, 25, { align: "center" })

    doc.setFontSize(customization.fontSize + 2)
    doc.setFont(customization.font, "normal")
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text("123 Business Street, City, State 12345", 105, 35, { align: "center" })
    doc.text("Phone: (555) 123-4567 | Email: contact@company.com", 105, 42, { align: "center" })

    // Decorative line
    doc.setLineWidth(2)
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.line(20, 50, 190, 50)

    // Invoice title
    doc.setFontSize(24)
    doc.setFont(customization.font, "bold")
    doc.text("INVOICE", 105, 65, { align: "center" })

    // Invoice details in classic table format
    doc.setFontSize(customization.fontSize + 2)
    doc.setFont(customization.font, "bold")
    doc.text("Invoice Number:", 20, 85)
    doc.text("Issue Date:", 20, 95)
    doc.text("Due Date:", 20, 105)
    doc.text("Status:", 20, 115)

    doc.setFont(customization.font, "normal")
    doc.text(invoice.invoice_number, 70, 85)
    doc.text(new Date(invoice.issue_date).toLocaleDateString(), 70, 95)
    doc.text(new Date(invoice.due_date).toLocaleDateString(), 70, 105)
    doc.text(invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1), 70, 115)

    // Bill To section
    doc.setFont(customization.font, "bold")
    doc.text("Bill To:", 120, 85)

    if (invoice.clients) {
      doc.setFont(customization.font, "normal")
      let yPos = 95
      doc.text(invoice.clients.name, 120, yPos)
      if (invoice.clients.company) {
        yPos += 10
        doc.text(invoice.clients.company, 120, yPos)
      }
      if (invoice.clients.email) {
        yPos += 10
        doc.text(invoice.clients.email, 120, yPos)
      }
      if (invoice.clients.address) {
        yPos += 10
        const addressLines = doc.splitTextToSize(invoice.clients.address, 70)
        doc.text(addressLines, 120, yPos)
      }
    }

    // Project title
    if (invoice.title) {
      doc.setFontSize(customization.fontSize + 4)
      doc.setFont(customization.font, "bold")
      doc.text("Project: " + invoice.title, 20, 140)
    }

    // Items table with classic styling
    const tableData = invoice.invoice_items.map((item: any) => [
      item.description,
      item.quantity.toString(),
      `$${Number(item.rate).toFixed(2)}`,
      `$${Number(item.amount).toFixed(2)}`,
    ])

    autoTable(doc, {
      head: [["Description", "Quantity", "Rate", "Amount"]],
      body: tableData,
      startY: 155,
      theme: "grid",
      headStyles: {
        fillColor: secondaryColor,
        textColor: textColor,
        fontSize: customization.fontSize + 2,
        fontStyle: "bold",
        halign: "center",
        font: customization.font,
      },
      bodyStyles: {
        fontSize: customization.fontSize + 1,
        textColor: textColor,
        font: customization.font,
      },
      columnStyles: {
        0: { cellWidth: 85, halign: "left" },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 20, right: 20 },
      showHead: "everyPage",
      pageBreak: "auto",
      tableWidth: "auto",
      styles: {
        overflow: "linebreak",
        cellWidth: "wrap",
      },
      tableWidth: 160,
    })

    // Get final Y position after table and add proper spacing
    const finalY = (doc as any).lastAutoTable.finalY + 20

    // Check if we need a new page for totals
    const pageHeight = doc.internal.pageSize.height
    let totalsStartY = finalY

    if (finalY > pageHeight - 80) {
      doc.addPage()
      totalsStartY = 30 // Start totals at top of new page
    }

    // Draw border around totals
    doc.setDrawColor(textColor[0], textColor[1], textColor[2])
    doc.setLineWidth(1)
    doc.rect(120, totalsStartY - 5, 70, 40)

    doc.setFontSize(customization.fontSize + 2)
    doc.setFont(customization.font, "normal")
    doc.text("Subtotal:", 125, totalsStartY + 5)
    doc.text(`$${Number(invoice.amount).toFixed(2)}`, 185, totalsStartY + 5, { align: "right" })

    if (invoice.tax_rate > 0) {
      doc.text(`Tax (${invoice.tax_rate}%):`, 125, totalsStartY + 15)
      doc.text(`$${Number(invoice.tax_amount).toFixed(2)}`, 185, totalsStartY + 15, { align: "right" })
    }

    // Double line for total
    doc.setLineWidth(2)
    doc.line(125, totalsStartY + 20, 185, totalsStartY + 20)

    doc.setFontSize(customization.fontSize + 4)
    doc.setFont(customization.font, "bold")
    doc.text("TOTAL:", 125, totalsStartY + 30)
    doc.text(`$${Number(invoice.total_amount).toFixed(2)}`, 185, totalsStartY + 30, { align: "right" })

    // Notes section
    if (invoice.notes) {
      const notesY = totalsStartY + 50
      doc.setFontSize(customization.fontSize + 2)
      doc.setFont(customization.font, "bold")
      doc.text("Notes:", 20, notesY)

      doc.setFontSize(customization.fontSize + 1)
      doc.setFont(customization.font, "normal")
      const splitNotes = doc.splitTextToSize(invoice.notes, 170)
      doc.text(splitNotes, 20, notesY + 10)
    }

    // Classic footer
    const currentPageHeight = doc.internal.pageSize.height
    doc.setLineWidth(1)
    doc.line(20, currentPageHeight - 30, 190, currentPageHeight - 30)

    doc.setFontSize(customization.fontSize)
    doc.setFont(customization.font, "italic")
    doc.text("Thank you for your business. Payment terms: Net 30 days.", 105, currentPageHeight - 20, {
      align: "center",
    })

    doc.save(`invoice-${invoice.invoice_number}-classic-custom.pdf`)
  }

  const generateMinimalPDF = (customization: TemplateCustomization) => {
    const doc = new jsPDF()

    // Set font
    doc.setFont(customization.font)

    // Minimal colors from customization
    const primaryColor = hexToRgb(customization.primaryColor)
    const textColor = hexToRgb(customization.textColor)
    const secondaryColor = hexToRgb(customization.secondaryColor)

    // Simple header
    doc.setFontSize(18)
    doc.setFont(customization.font, "normal")
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text("Invoice", 20, 30)

    // Invoice number
    doc.setFontSize(customization.fontSize + 2)
    doc.text(`#${invoice.invoice_number}`, 20, 45)

    // Dates
    doc.setFontSize(customization.fontSize)
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text(`Issued: ${new Date(invoice.issue_date).toLocaleDateString()}`, 20, 55)
    doc.text(`Due: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, 62)

    // Status
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text(`Status: ${invoice.status}`, 20, 72)

    // From/To section
    doc.setFontSize(customization.fontSize + 2)
    doc.setFont(customization.font, "bold")
    doc.text("From:", 20, 90)
    doc.text("To:", 120, 90)

    doc.setFont(customization.font, "normal")
    doc.setFontSize(customization.fontSize)
    doc.text("Your Company", 20, 100)
    doc.text("contact@company.com", 20, 107)

    if (invoice.clients) {
      doc.text(invoice.clients.name, 120, 100)
      if (invoice.clients.company) {
        doc.text(invoice.clients.company, 120, 107)
      }
      if (invoice.clients.email) {
        doc.text(invoice.clients.email, 120, 114)
      }
    }

    // Project
    if (invoice.title) {
      doc.setFontSize(customization.fontSize + 1)
      doc.setFont(customization.font, "bold")
      doc.text("Project:", 20, 130)
      doc.setFont(customization.font, "normal")
      doc.text(invoice.title, 20, 140)
    }

    // Simple table
    const tableData = invoice.invoice_items.map((item: any) => [
      item.description,
      item.quantity.toString(),
      `$${Number(item.rate).toFixed(2)}`,
      `$${Number(item.amount).toFixed(2)}`,
    ])

    autoTable(doc, {
      head: [["Item", "Qty", "Rate", "Amount"]],
      body: tableData,
      startY: 155,
      theme: "plain",
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: textColor,
        fontSize: customization.fontSize + 1,
        fontStyle: "bold",
        lineColor: textColor,
        lineWidth: 0.5,
        font: customization.font,
      },
      bodyStyles: {
        fontSize: customization.fontSize,
        textColor: textColor,
        font: customization.font,
      },
      columnStyles: {
        0: { cellWidth: 85, halign: "left" },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 20, right: 20 },
      showHead: "everyPage",
      pageBreak: "auto",
      tableWidth: "auto",
      styles: {
        overflow: "linebreak",
        cellWidth: "wrap",
      },
      tableWidth: 160,
    })

    // Get final Y position after table and add proper spacing
    const finalY = (doc as any).lastAutoTable.finalY + 20

    // Check if we need a new page for totals
    const pageHeight = doc.internal.pageSize.height
    let totalsStartY = finalY

    if (finalY > pageHeight - 80) {
      doc.addPage()
      totalsStartY = 30 // Start totals at top of new page
    }

    // Simple totals
    doc.setFontSize(customization.fontSize + 1)
    doc.text("Subtotal", 140, totalsStartY)
    doc.text(`$${Number(invoice.amount).toFixed(2)}`, 185, totalsStartY, { align: "right" })

    if (invoice.tax_rate > 0) {
      doc.text(`Tax (${invoice.tax_rate}%)`, 140, totalsStartY + 10)
      doc.text(`$${Number(invoice.tax_amount).toFixed(2)}`, 185, totalsStartY + 10, { align: "right" })
    }

    // Simple line
    doc.setLineWidth(0.5)
    doc.line(140, totalsStartY + 15, 185, totalsStartY + 15)

    doc.setFont(customization.font, "bold")
    doc.text("Total", 140, totalsStartY + 25)
    doc.text(`$${Number(invoice.total_amount).toFixed(2)}`, 185, totalsStartY + 25, { align: "right" })

    // Minimal notes
    if (invoice.notes) {
      const notesY = totalsStartY + 45
      doc.setFontSize(customization.fontSize)
      doc.setFont(customization.font, "normal")
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.text("Notes:", 20, notesY)

      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      const splitNotes = doc.splitTextToSize(invoice.notes, 170)
      doc.text(splitNotes, 20, notesY + 10)
    }

    doc.save(`invoice-${invoice.invoice_number}-minimal-custom.pdf`)
  }

  const generateCorporatePDF = (customization: TemplateCustomization) => {
    const doc = new jsPDF()

    // Set font
    doc.setFont(customization.font)

    // Corporate colors from customization
    const primaryColor = hexToRgb(customization.primaryColor)
    const accentColor = hexToRgb(customization.accentColor)
    const textColor = hexToRgb(customization.textColor)
    const secondaryColor = hexToRgb(customization.secondaryColor)

    // Corporate header with accent
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, 210, 60, "F")

    // Accent bar
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
    doc.rect(0, 55, 210, 5, "F")

    // Company information
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont(customization.font, "bold")
    doc.text("CORPORATE SOLUTIONS", 20, 25)

    doc.setFontSize(customization.fontSize + 1)
    doc.setFont(customization.font, "normal")
    doc.text("Professional Business Services", 20, 35)
    doc.text("1234 Corporate Blvd, Suite 100, Business City, BC 12345", 20, 42)
    doc.text("Tel: (555) 123-4567 | Fax: (555) 123-4568 | www.company.com", 20, 49)

    // Invoice title with accent background
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
    doc.rect(140, 15, 50, 20, "F")
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setFontSize(20)
    doc.setFont(customization.font, "bold")
    doc.text("INVOICE", 165, 28, { align: "center" })

    // Reset text color
    doc.setTextColor(textColor[0], textColor[1], textColor[2])

    // Professional information boxes
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.rect(20, 75, 85, 50, "F")
    doc.rect(115, 75, 75, 50, "F")

    // Invoice details
    doc.setFontSize(customization.fontSize + 2)
    doc.setFont(customization.font, "bold")
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text("INVOICE DETAILS", 25, 85)

    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.setFont(customization.font, "normal")
    doc.setFontSize(customization.fontSize)
    doc.text(`Invoice Number: ${invoice.invoice_number}`, 25, 95)
    doc.text(
      `Issue Date: ${new Date(invoice.issue_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      25,
      102,
    )
    doc.text(
      `Due Date: ${new Date(invoice.due_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      25,
      109,
    )

    // Status with corporate styling
    doc.setFont(customization.font, "bold")
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 25, 116)

    // Client information
    doc.setFontSize(customization.fontSize + 2)
    doc.setFont(customization.font, "bold")
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text("BILL TO", 120, 85)

    if (invoice.clients) {
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.setFont(customization.font, "normal")
      doc.setFontSize(customization.fontSize)
      let yPos = 95

      doc.setFont(customization.font, "bold")
      doc.text(invoice.clients.name, 120, yPos)
      yPos += 7

      doc.setFont(customization.font, "normal")
      if (invoice.clients.company) {
        doc.text(invoice.clients.company, 120, yPos)
        yPos += 7
      }
      if (invoice.clients.email) {
        doc.text(invoice.clients.email, 120, yPos)
        yPos += 7
      }
      if (invoice.clients.address) {
        const addressLines = doc.splitTextToSize(invoice.clients.address, 65)
        doc.text(addressLines, 120, yPos)
      }
    }

    // Project section
    if (invoice.title) {
      doc.setFontSize(customization.fontSize + 4)
      doc.setFont(customization.font, "bold")
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.text("PROJECT DETAILS", 20, 145)

      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.setFont(customization.font, "normal")
      doc.setFontSize(customization.fontSize + 2)
      doc.text(invoice.title, 20, 155)
    }

    // Corporate table
    const tableData = invoice.invoice_items.map((item: any) => [
      item.description,
      item.quantity.toString(),
      `$${Number(item.rate).toFixed(2)}`,
      `$${Number(item.amount).toFixed(2)}`,
    ])

    autoTable(doc, {
      head: [["DESCRIPTION", "QTY", "RATE", "AMOUNT"]],
      body: tableData,
      startY: 170,
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: customization.fontSize + 1,
        fontStyle: "bold",
        halign: "center",
        font: customization.font,
      },
      bodyStyles: {
        fontSize: customization.fontSize,
        textColor: textColor,
        font: customization.font,
      },
      alternateRowStyles: {
        fillColor: secondaryColor,
      },
      columnStyles: {
        0: { cellWidth: 85, halign: "left" },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 20, right: 20 },
      showHead: "everyPage",
      pageBreak: "auto",
      tableWidth: "auto",
      styles: {
        overflow: "linebreak",
        cellWidth: "wrap",
      },
      tableWidth: 160,
    })

    // Get final Y position after table and add proper spacing
    const finalY = (doc as any).lastAutoTable.finalY + 15

    // Check if we need a new page for totals
    const pageHeight = doc.internal.pageSize.height
    let totalsStartY = finalY

    if (finalY > pageHeight - 80) {
      doc.addPage()
      totalsStartY = 30 // Start totals at top of new page
    }

    // Accent for totals
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
    doc.rect(120, totalsStartY - 5, 70, 3, "F")

    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.rect(120, totalsStartY - 2, 70, 45, "F")

    doc.setFontSize(customization.fontSize + 1)
    doc.setFont(customization.font, "normal")
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text("Subtotal:", 125, totalsStartY + 8)
    doc.text(`$${Number(invoice.amount).toFixed(2)}`, 185, totalsStartY + 8, { align: "right" })

    if (invoice.tax_rate > 0) {
      doc.text(`Tax (${invoice.tax_rate}%):`, 125, totalsStartY + 18)
      doc.text(`$${Number(invoice.tax_amount).toFixed(2)}`, 185, totalsStartY + 18, { align: "right" })
    }

    // Corporate total
    doc.setFontSize(customization.fontSize + 4)
    doc.setFont(customization.font, "bold")
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text("TOTAL AMOUNT:", 125, totalsStartY + 33)
    doc.text(`$${Number(invoice.total_amount).toFixed(2)}`, 185, totalsStartY + 33, { align: "right" })

    // Corporate terms
    const termsY = totalsStartY + 55
    doc.setFontSize(customization.fontSize + 2)
    doc.setFont(customization.font, "bold")
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text("PAYMENT TERMS & CONDITIONS", 20, termsY)

    doc.setFontSize(9)
    doc.setFont(customization.font, "normal")
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    const corporateTerms = [
      "• Payment is due within 30 days of invoice date unless otherwise specified",
      "• Late payments are subject to a service charge of 1.5% per month",
      "• All disputes must be reported within 10 days of invoice date",
      "• This invoice is subject to our standard terms and conditions",
      "• Please remit payment to the address shown above or via electronic transfer",
    ]

    corporateTerms.forEach((term, index) => {
      doc.text(term, 20, termsY + 10 + index * 6)
    })

    // Corporate footer
    const currentPageHeight = doc.internal.pageSize.height
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, currentPageHeight - 30, 210, 25, "F")

    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
    doc.rect(0, currentPageHeight - 30, 210, 3, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont(customization.font, "normal")
    doc.text("CORPORATE SOLUTIONS - Professional Business Services", 20, currentPageHeight - 20)
    doc.text("Thank you for choosing our professional services.", 20, currentPageHeight - 12)

    doc.text(`Invoice #${invoice.invoice_number} | Page 1 of 1`, 185, currentPageHeight - 12, { align: "right" })

    doc.save(`invoice-${invoice.invoice_number}-corporate-custom.pdf`)
  }

  const resetToDefaults = (template: PDFTemplate) => {
    setCustomizations((prev) => ({
      ...prev,
      [template]: defaultCustomizations[template],
    }))
  }

  const saveTemplate = () => {
    const newTemplate: SavedTemplate = {
      id: Math.random().toString(36).substring(7), // Generate a random ID
      name: templateName,
      baseTemplate: selectedTemplate,
      customization: customizations[selectedTemplate],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setSavedTemplates((prev) => [...prev, newTemplate])
    toast.success(`Template "${templateName}" saved successfully!`)
    setShowSaveDialog(false)
    setTemplateName("") // Reset template name after saving
  }

  const loadTemplate = (template: SavedTemplate) => {
    setCustomizations((prev) => ({
      ...prev,
      [template.baseTemplate]: template.customization,
    }))
    setSelectedTemplate(template.baseTemplate)
    toast.success(`Template "${template.name}" loaded!`)
    setShowLoadDialog(false)
  }

  const updateSavedTemplate = (templateId: string) => {
    setSavedTemplates((prev) =>
      prev.map((template) => {
        if (template.id === templateId) {
          const updatedTemplate: SavedTemplate = {
            ...template,
            customization: customizations[template.baseTemplate],
            updatedAt: new Date().toISOString(),
          }
          toast.success(`Template "${template.name}" updated!`)
          return updatedTemplate
        }
        return template
      }),
    )
  }

  const deleteTemplate = (templateId: string) => {
    setSavedTemplates((prev) => prev.filter((template) => template.id !== templateId))
    toast.success("Template deleted successfully!")
  }

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Download PDF
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => generatePDF("modern")}>
            <div className="flex flex-col items-start">
              <span className="font-medium">Modern</span>
              <span className="text-xs text-muted-foreground">Blue header, clean design</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => generatePDF("classic")}>
            <div className="flex flex-col items-start">
              <span className="font-medium">Classic</span>
              <span className="text-xs text-muted-foreground">Traditional brown, formal</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => generatePDF("minimal")}>
            <div className="flex flex-col items-start">
              <span className="font-medium">Minimal</span>
              <span className="text-xs text-muted-foreground">Clean black & white</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => generatePDF("corporate")}>
            <div className="flex flex-col items-start">
              <span className="font-medium">Corporate</span>
              <span className="text-xs text-muted-foreground">Navy & gold, professional</span>
            </div>
          </DropdownMenuItem>
          {savedTemplates.length > 0 && (
            <>
              <DropdownMenuSeparator />
              {savedTemplates.slice(0, 3).map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onClick={() => {
                    loadTemplate(template)
                    generatePDF(template.baseTemplate)
                  }}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{template.name}</span>
                    <span className="text-xs text-muted-foreground">Custom {template.baseTemplate} template</span>
                  </div>
                </DropdownMenuItem>
              ))}
              {savedTemplates.length > 3 && (
                <DropdownMenuItem onClick={() => setShowLoadDialog(true)}>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    <span>View all saved templates...</span>
                  </div>
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCustomization} onOpenChange={setShowCustomization}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Palette className="h-4 w-4" />
            Customize
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Customize PDF Templates
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="customize" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customize" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Customize
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customize" className="space-y-6">
              {/* Template Selection */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="template-select">Select Template to Customize</Label>
                  <Select value={selectedTemplate} onValueChange={(value: PDFTemplate) => setSelectedTemplate(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern Template</SelectItem>
                      <SelectItem value="classic">Classic Template</SelectItem>
                      <SelectItem value="minimal">Minimal Template</SelectItem>
                      <SelectItem value="corporate">Corporate Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Template
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowLoadDialog(true)} className="gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Load Template
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Color Customization */}
                <Card>
                  <CardHeader>
                    <CardTitle>Colors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="primary-color"
                          type="color"
                          value={customizations[selectedTemplate].primaryColor}
                          onChange={(e) => updateCustomization(selectedTemplate, "primaryColor", e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={customizations[selectedTemplate].primaryColor}
                          onChange={(e) => updateCustomization(selectedTemplate, "primaryColor", e.target.value)}
                          className="flex-1"
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={customizations[selectedTemplate].secondaryColor}
                          onChange={(e) => updateCustomization(selectedTemplate, "secondaryColor", e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={customizations[selectedTemplate].secondaryColor}
                          onChange={(e) => updateCustomization(selectedTemplate, "secondaryColor", e.target.value)}
                          className="flex-1"
                          placeholder="#475569"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="accent-color">Accent Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="accent-color"
                          type="color"
                          value={customizations[selectedTemplate].accentColor}
                          onChange={(e) => updateCustomization(selectedTemplate, "accentColor", e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={customizations[selectedTemplate].accentColor}
                          onChange={(e) => updateCustomization(selectedTemplate, "accentColor", e.target.value)}
                          className="flex-1"
                          placeholder="#EF4444"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="text-color">Text Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="text-color"
                          type="color"
                          value={customizations[selectedTemplate].textColor}
                          onChange={(e) => updateCustomization(selectedTemplate, "textColor", e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={customizations[selectedTemplate].textColor}
                          onChange={(e) => updateCustomization(selectedTemplate, "textColor", e.target.value)}
                          className="flex-1"
                          placeholder="#1F2937"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Typography Customization */}
                <Card>
                  <CardHeader>
                    <CardTitle>Typography</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="font-family">Font Family</Label>
                      <Select
                        value={customizations[selectedTemplate].font}
                        onValueChange={(value) => updateCustomization(selectedTemplate, "font", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="helvetica">Helvetica (Sans-serif)</SelectItem>
                          <SelectItem value="times">Times (Serif)</SelectItem>
                          <SelectItem value="courier">Courier (Monospace)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="font-size">Base Font Size</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="font-size"
                          type="number"
                          min="8"
                          max="16"
                          value={customizations[selectedTemplate].fontSize}
                          onChange={(e) =>
                            updateCustomization(selectedTemplate, "fontSize", Number.parseInt(e.target.value))
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">pt</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button variant="outline" onClick={() => resetToDefaults(selectedTemplate)} className="w-full">
                        Reset to Defaults
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Color Preview Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Color Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div
                        className="w-full h-16 rounded border mb-2"
                        style={{ backgroundColor: customizations[selectedTemplate].primaryColor }}
                      />
                      <p className="text-sm font-medium">Primary</p>
                      <p className="text-xs text-muted-foreground">{customizations[selectedTemplate].primaryColor}</p>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-full h-16 rounded border mb-2"
                        style={{ backgroundColor: customizations[selectedTemplate].secondaryColor }}
                      />
                      <p className="text-sm font-medium">Secondary</p>
                      <p className="text-xs text-muted-foreground">{customizations[selectedTemplate].secondaryColor}</p>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-full h-16 rounded border mb-2"
                        style={{ backgroundColor: customizations[selectedTemplate].accentColor }}
                      />
                      <p className="text-sm font-medium">Accent</p>
                      <p className="text-xs text-muted-foreground">{customizations[selectedTemplate].accentColor}</p>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-full h-16 rounded border mb-2"
                        style={{ backgroundColor: customizations[selectedTemplate].textColor }}
                      />
                      <p className="text-sm font-medium">Text</p>
                      <p className="text-xs text-muted-foreground">{customizations[selectedTemplate].textColor}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Live Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    See how your customized {selectedTemplate} template will look
                  </p>
                </div>
                <Select value={selectedTemplate} onValueChange={(value: PDFTemplate) => setSelectedTemplate(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern Template</SelectItem>
                    <SelectItem value="classic">Classic Template</SelectItem>
                    <SelectItem value="minimal">Minimal Template</SelectItem>
                    <SelectItem value="corporate">Corporate Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-[600px] w-full border rounded-lg p-4">
                <TemplatePreview
                  template={selectedTemplate}
                  customization={customizations[selectedTemplate]}
                  invoice={invoice}
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCustomization(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                generatePDF(selectedTemplate)
                setShowCustomization(false)
              }}
            >
              Generate Custom PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Save Custom Template
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter a name for your custom template"
                className="mt-1"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              This will save your current customizations for the {selectedTemplate} template.
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveTemplate}>Save Template</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Template Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Saved Templates
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {savedTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Save className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No saved templates yet</p>
                <p className="text-sm">Create and save your first custom template to see it here.</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {savedTemplates.map((template) => (
                    <Card key={template.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">Based on {template.baseTemplate} template</p>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(template.createdAt).toLocaleDateString()}
                            {template.updatedAt !== template.createdAt && (
                              <span> • Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: template.customization.primaryColor }}
                              title="Primary Color"
                            />
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: template.customization.secondaryColor }}
                              title="Secondary Color"
                            />
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: template.customization.accentColor }}
                              title="Accent Color"
                            />
                          </div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => loadTemplate(template)}>
                              Load
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                loadTemplate(template)
                                updateSavedTemplate(template.id)
                              }}
                              title="Update this template with current customizations"
                            >
                              Update
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive bg-transparent"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{template.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteTemplate(template.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
