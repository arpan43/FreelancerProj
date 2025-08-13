"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Copy, CreditCard, LinkIcon, Plus, Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaymentActionsProps {
  invoice: any
}

export default function PaymentActions({ invoice }: PaymentActionsProps) {
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [paymentLink, setPaymentLink] = useState(invoice.payment_link || "")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUser(user)
    }

    getCurrentUser()
  }, [supabase.auth])

  const generatePaymentLink = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate payment links",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingLink(true)
    try {
      // Generate a simple payment link (in a real app, this would integrate with a payment processor)
      const linkUrl = `${window.location.origin}/pay/${invoice.id}?amount=${invoice.total_amount}`

      // Update the invoice with the payment link
      const { error } = await supabase
        .from("invoices")
        .update({ payment_link: linkUrl })
        .eq("id", invoice.id)
        .eq("user_id", currentUser.id)

      if (error) throw error

      setPaymentLink(linkUrl)
      toast({
        title: "Payment Link Generated",
        description: "Payment link has been created successfully",
      })
    } catch (error) {
      console.error("Error generating payment link:", error)
      toast({
        title: "Error",
        description: "Failed to generate payment link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const copyPaymentLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Payment link copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy payment link",
        variant: "destructive",
      })
    }
  }

  const recordPayment = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to record payments",
        variant: "destructive",
      })
      return
    }

    if (!paymentAmount || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in the payment amount and method",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      })
      return
    }

    setIsRecordingPayment(true)
    try {
      // Insert payment record
      const { error: paymentError } = await supabase.from("payments").insert({
        invoice_id: invoice.id,
        user_id: currentUser.id,
        amount: amount,
        payment_method: paymentMethod,
        payment_reference: paymentReference || null,
        notes: paymentNotes || null,
        status: "completed",
        processed_at: new Date().toISOString(),
      })

      if (paymentError) {
        console.error("Error recording payment:", paymentError)
        throw paymentError
      }

      // Check if invoice is fully paid and update status
      const { data: payments } = await supabase
        .from("payments")
        .select("amount")
        .eq("invoice_id", invoice.id)
        .eq("status", "completed")

      const totalPaid = (payments || []).reduce((sum, payment) => sum + Number(payment.amount), 0) + amount
      const newStatus = totalPaid >= Number(invoice.total_amount) ? "paid" : "partial"

      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          status: newStatus,
          paid_at: newStatus === "paid" ? new Date().toISOString() : null,
        })
        .eq("id", invoice.id)
        .eq("user_id", currentUser.id)

      if (invoiceError) {
        console.error("Error updating invoice status:", invoiceError)
        // Don't throw here as the payment was recorded successfully
      }

      toast({
        title: "Payment Recorded",
        description: "Payment has been recorded successfully",
      })

      // Reset form
      setPaymentAmount("")
      setPaymentMethod("")
      setPaymentReference("")
      setPaymentNotes("")
      setIsDialogOpen(false)

      // Refresh the page to show updated payment information
      router.refresh()
    } catch (error) {
      console.error("Error recording payment:", error)
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRecordingPayment(false)
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
    <Card>
      <CardHeader>
        <CardTitle>Payment Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Link */}
        <div className="space-y-2">
          <Label>Payment Link</Label>
          {paymentLink ? (
            <div className="flex space-x-2">
              <Input value={paymentLink} readOnly className="flex-1 bg-gray-50" />
              <Button onClick={copyPaymentLink} variant="outline" size="sm">
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
        </div>

        {/* Record Payment */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full bg-transparent">
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Payment Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="method">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reference">Payment Reference</Label>
                <Input
                  id="reference"
                  placeholder="Transaction ID, check number, etc."
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this payment..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={recordPayment}
                  disabled={isRecordingPayment}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isRecordingPayment ? "Recording..." : "Record Payment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
