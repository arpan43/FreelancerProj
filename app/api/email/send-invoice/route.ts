import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, recipientEmail, recipientName, customMessage } = await request.json()

    if (!invoiceId || !recipientEmail) {
      return NextResponse.json({ error: "Invoice ID and recipient email are required" }, { status: 400 })
    }

    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's email settings
    const { data: settings, error: settingsError } = await supabase
      .from("email_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (settingsError || !settings || !settings.resend_api_key) {
      return NextResponse.json({ error: "Email settings not configured" }, { status: 400 })
    }

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        clients (
          name,
          email,
          company
        )
      `)
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Get email template
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("user_id", user.id)
      .eq("template_type", "invoice")
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: "Email template not found" }, { status: 400 })
    }

    // Replace template variables
    const templateVars = {
      client_name: recipientName || invoice.clients?.name || "Valued Client",
      sender_name: settings.sender_name,
      invoice_number: invoice.invoice_number,
      invoice_date: new Date(invoice.date).toLocaleDateString(),
      due_date: new Date(invoice.due_date).toLocaleDateString(),
      total_amount: invoice.total.toFixed(2),
      custom_message: customMessage || "",
      email_signature: settings.email_signature || "",
    }

    let subject = template.subject_template
    let htmlContent = template.html_template
    let textContent = template.text_template

    // Simple template variable replacement
    Object.entries(templateVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g")
      subject = subject.replace(regex, value)
      htmlContent = htmlContent.replace(regex, value)
      textContent = textContent.replace(regex, value)
    })

    // Handle conditional blocks (simple implementation)
    if (customMessage) {
      htmlContent = htmlContent.replace(/{{#if custom_message}}/g, "")
      htmlContent = htmlContent.replace(/{{\/if}}/g, "")
      textContent = textContent.replace(/{{#if custom_message}}/g, "")
      textContent = textContent.replace(/{{\/if}}/g, "")
    } else {
      // Remove conditional blocks if no custom message
      htmlContent = htmlContent.replace(/{{#if custom_message}}[\s\S]*?{{\/if}}/g, "")
      textContent = textContent.replace(/{{#if custom_message}}[\s\S]*?{{\/if}}/g, "")
    }

    if (settings.email_signature) {
      htmlContent = htmlContent.replace(/{{#if email_signature}}/g, "")
      htmlContent = htmlContent.replace(/{{\/if}}/g, "")
      textContent = textContent.replace(/{{#if email_signature}}/g, "")
      textContent = textContent.replace(/{{\/if}}/g, "")
    } else {
      htmlContent = htmlContent.replace(/{{#if email_signature}}[\s\S]*?{{\/if}}/g, "")
      textContent = textContent.replace(/{{#if email_signature}}[\s\S]*?{{\/if}}/g, "")
    }

    // Use user's API key
    const userResend = new Resend(settings.resend_api_key)

    const emailData = {
      from: `${settings.sender_name} <${settings.sender_email}>`,
      to: [recipientEmail],
      subject,
      html: htmlContent,
      text: textContent,
      ...(settings.reply_to_email && { replyTo: settings.reply_to_email }),
    }

    const { data, error } = await userResend.emails.send(emailData)

    if (error) {
      console.error("Resend error:", error)

      // Log failed email
      await supabase.from("email_history").insert({
        user_id: user.id,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        subject,
        email_type: "invoice",
        related_id: invoiceId,
        status: "failed",
        error_message: error.message,
      })

      return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 400 })
    }

    // Log successful email
    await supabase.from("email_history").insert({
      user_id: user.id,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      subject,
      email_type: "invoice",
      related_id: invoiceId,
      status: "sent",
      resend_id: data?.id,
    })

    return NextResponse.json({
      success: true,
      message: "Invoice email sent successfully",
      id: data?.id,
    })
  } catch (error) {
    console.error("Error sending invoice email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
