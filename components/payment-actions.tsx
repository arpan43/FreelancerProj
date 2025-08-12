"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, LinkIcon, Copy, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface PaymentActionsProps {
  invoice: any
}

export default function PaymentActions({ invoice }: PaymentActionsProps) {
  const [paymentLink, setPaymentLink] = useState(invoice.payment_link || "")
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [recordingPayment, setRecordingPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(invoice.total_amount)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentReference, setPaymentReference] = useState("")

  const { toast } = useToast()
  const supabase = createClient()

  const generatePaymentLink = async () => {
    setIsGeneratingLink(true)
    try {
      // In a real implementation, this would integrate with a payment provider
      const mockPaymentLink = `https://pay.example.com/invoice/${invoice.id}?amount=${invoice.total_amount}`

      const { error } = await supabase.from("invoices").update({ payment_link: mockPaymentLink }).eq("id", invoice.id)

      if (error) throw error

      setPaymentLink(mockPaymentLink)
      toast({
        title: "Success",
        description: "Payment link generated successfully",
      })
    } catch (error) {
      console.error("Error generating payment link:", error)
      toast({
        title: "Error",
        description: "Failed to generate payment link",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const copyPaymentLink = async () => {
    if (paymentLink) {
      await navigator.clipboard.writeText(paymentLink)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast({
        title: "Copied",
        description: "Payment link copied to clipboard",
      })
    }
  }

  const recordPayment = async () => {
    if (!paymentMethod || !paymentAmount) {
      toast({
        title: "Error",
        description: "Please fill in all payment details",
        variant: "destructive",
      })
      return
    }

    setRecordingPayment(true)
    try {
      // Record the payment
      const { error: paymentError } = await supabase.from("payments").insert({
        invoice_id: invoice.id,
        amount: paymentAmount,
        payment_method: paymentMethod,
        payment_reference: paymentReference || null,
        status: "completed",
        processed_at: new Date().toISOString(),
      })

      if (paymentError) throw paymentError

      // Update invoice status to paid
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", invoice.id)

      if (invoiceError) throw invoiceError

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      })

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error recording payment:", error)
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      })
    } finally {
      setRecordingPayment(false)
    }
  }

  if (invoice.status === "paid") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <Check className="h-5 w-5 mr-2" />
            Payment Received
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            This invoice has been paid in full on {new Date(invoice.paid_at).toLocaleDateString()}.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payment Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentLink ? (
            <div className="space-y-2">
              <Input value={paymentLink} readOnly className="bg-gray-50" />
              <Button onClick={copyPaymentLink} variant="outline" className="w-full bg-transparent">
                {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {isCopied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          ) : (
            <Button
              onClick={generatePaymentLink}
              disabled={isGeneratingLink}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              {isGeneratingLink ? "Generating..." : "Generate Payment Link"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <Input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reference/Transaction ID</label>
            <Input
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Optional reference number"
            />
          </div>

          <Button
            onClick={recordPayment}
            disabled={recordingPayment}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            {recordingPayment ? "Recording..." : "Record Payment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
