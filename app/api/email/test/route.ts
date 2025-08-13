import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json()

    if (!to) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 })
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

    if (settingsError || !settings) {
      return NextResponse.json({ error: "Email settings not configured" }, { status: 400 })
    }

    if (!settings.resend_api_key) {
      return NextResponse.json({ error: "Resend API key not configured" }, { status: 400 })
    }

    // Use user's API key
    const userResend = new Resend(settings.resend_api_key)

    const emailData = {
      from: `${settings.sender_name} <${settings.sender_email}>`,
      to: [to],
      subject: "Test Email from FreelancerPro",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Test Email</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">From FreelancerPro</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello!</p>
            
            <p>This is a test email to verify your email configuration is working correctly.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #667eea;">Configuration Details:</h3>
              <p style="margin: 5px 0;"><strong>Sender:</strong> ${settings.sender_name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${settings.sender_email}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p>If you received this email, your FreelancerPro email integration is working perfectly!</p>
            
            ${
              settings.email_signature
                ? `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
              ${settings.email_signature.replace(/\n/g, "<br>")}
            </div>
            `
                : ""
            }
          </div>
        </body>
        </html>
      `,
      text: `Hello!

This is a test email to verify your email configuration is working correctly.

Configuration Details:
- Sender: ${settings.sender_name}
- Email: ${settings.sender_email}
- Date: ${new Date().toLocaleString()}

If you received this email, your FreelancerPro email integration is working perfectly!

${settings.email_signature || ""}`,
      ...(settings.reply_to_email && { replyTo: settings.reply_to_email }),
    }

    const { data, error } = await userResend.emails.send(emailData)

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 400 })
    }

    // Log the email in history
    await supabase.from("email_history").insert({
      user_id: user.id,
      recipient_email: to,
      recipient_name: "Test Recipient",
      subject: "Test Email from FreelancerPro",
      email_type: "test",
      status: "sent",
      resend_id: data?.id,
    })

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      id: data?.id,
    })
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
