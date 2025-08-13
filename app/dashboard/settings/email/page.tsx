"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Send, CheckCircle, AlertCircle, Settings, LayoutTemplateIcon as Template, History } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface EmailSettings {
  id?: string
  resend_api_key: string
  sender_name: string
  sender_email: string
  reply_to_email: string
  email_signature: string
  is_configured: boolean
}

interface EmailTemplate {
  id?: string
  template_type: string
  subject_template: string
  html_template: string
  text_template: string
  is_active: boolean
}

interface EmailHistory {
  id: string
  recipient_email: string
  recipient_name: string
  subject: string
  email_type: string
  status: string
  sent_at: string
  delivered_at: string | null
}

const client_name = "Client Name" // Declare client_name variable
const sender_name = "Sender Name" // Declare sender_name variable
const custom_message = "Custom Message" // Declare custom_message variable

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>({
    resend_api_key: "",
    sender_name: "",
    sender_email: "",
    reply_to_email: "",
    email_signature: "",
    is_configured: false,
  })

  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [activeTab, setActiveTab] = useState("settings")

  const supabase = createClient()

  useEffect(() => {
    loadEmailSettings()
    loadEmailTemplates()
    loadEmailHistory()
  }, [])

  const loadEmailSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from("email_settings").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading email settings:", error)
        return
      }

      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error("Error loading email settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadEmailTemplates = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("template_type")

      if (error) {
        console.error("Error loading email templates:", error)
        return
      }

      setTemplates(data || [])
    } catch (error) {
      console.error("Error loading email templates:", error)
    }
  }

  const loadEmailHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("email_history")
        .select("*")
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false })
        .limit(50)

      if (error) {
        console.error("Error loading email history:", error)
        return
      }

      setEmailHistory(data || [])
    } catch (error) {
      console.error("Error loading email history:", error)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const settingsData = {
        ...settings,
        user_id: user.id,
        is_configured: !!(settings.resend_api_key && settings.sender_name && settings.sender_email),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("email_settings").upsert(settingsData, { onConflict: "user_id" })

      if (error) {
        console.error("Error saving email settings:", error)
        toast.error("Failed to save email settings")
        return
      }

      toast.success("Email settings saved successfully!")
      loadEmailSettings()
    } catch (error) {
      console.error("Error saving email settings:", error)
      toast.error("Failed to save email settings")
    } finally {
      setSaving(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address")
      return
    }

    setTesting(true)
    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: testEmail,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Test email sent successfully!")
        loadEmailHistory()
      } else {
        toast.error(result.error || "Failed to send test email")
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      toast.error("Failed to send test email")
    } finally {
      setTesting(false)
    }
  }

  const updateTemplate = async (templateType: string, updates: Partial<EmailTemplate>) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("email_templates").upsert(
        {
          user_id: user.id,
          template_type: templateType,
          ...updates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,template_type" },
      )

      if (error) {
        console.error("Error updating template:", error)
        toast.error("Failed to update template")
        return
      }

      toast.success("Template updated successfully!")
      loadEmailTemplates()
    } catch (error) {
      console.error("Error updating template:", error)
      toast.error("Failed to update template")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="secondary">Sent</Badge>
      case "delivered":
        return <Badge variant="default">Delivered</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "bounced":
        return <Badge variant="destructive">Bounced</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading email settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Email Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure your email integration to send invoices and proposals to clients.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Template className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Configuration
                  </CardTitle>
                  <CardDescription>Set up your Resend API key and sender information</CardDescription>
                </div>
                {settings.is_configured && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Configured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need a Resend API key to send emails. Get one at{" "}
                  <a
                    href="https://resend.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    resend.com
                  </a>
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="api-key">Resend API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="re_..."
                    value={settings.resend_api_key}
                    onChange={(e) => setSettings({ ...settings, resend_api_key: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sender-name">Sender Name</Label>
                    <Input
                      id="sender-name"
                      placeholder="Your Name"
                      value={settings.sender_name}
                      onChange={(e) => setSettings({ ...settings, sender_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sender-email">Sender Email</Label>
                    <Input
                      id="sender-email"
                      type="email"
                      placeholder="you@yourdomain.com"
                      value={settings.sender_email}
                      onChange={(e) => setSettings({ ...settings, sender_email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reply-to">Reply-To Email (Optional)</Label>
                  <Input
                    id="reply-to"
                    type="email"
                    placeholder="replies@yourdomain.com"
                    value={settings.reply_to_email}
                    onChange={(e) => setSettings({ ...settings, reply_to_email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="signature">Email Signature</Label>
                  <Textarea
                    id="signature"
                    placeholder="Best regards,&#10;Your Name&#10;Your Company"
                    rows={4}
                    value={settings.email_signature}
                    onChange={(e) => setSettings({ ...settings, email_signature: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Test Email
              </CardTitle>
              <CardDescription>Send a test email to verify your configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-email">Test Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <Button onClick={sendTestEmail} disabled={testing || !settings.is_configured} variant="outline">
                {testing ? "Sending..." : "Send Test Email"}
              </Button>
              {!settings.is_configured && (
                <p className="text-sm text-gray-500">Please save your settings first before testing</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {templates.map((template) => (
            <Card key={template.template_type}>
              <CardHeader>
                <CardTitle className="capitalize">{template.template_type} Template</CardTitle>
                <CardDescription>Customize the email template for {template.template_type}s</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Subject Template</Label>
                  <Input
                    value={template.subject_template}
                    onChange={(e) =>
                      updateTemplate(template.template_type, {
                        subject_template: e.target.value,
                      })
                    }
                    placeholder="Subject line with {{variables}}"
                  />
                </div>
                <div>
                  <Label>HTML Template</Label>
                  <Textarea
                    value={template.html_template}
                    onChange={(e) =>
                      updateTemplate(template.template_type, {
                        html_template: e.target.value,
                      })
                    }
                    rows={10}
                    placeholder="HTML email template with {{variables}}"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  Available variables: {`{${client_name}}, {${sender_name}}, {${custom_message}}, etc.`}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
              <CardDescription>Recent emails sent from your account</CardDescription>
            </CardHeader>
            <CardContent>
              {emailHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No emails sent yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emailHistory.map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{email.subject}</span>
                          {getStatusBadge(email.status)}
                        </div>
                        <div className="text-sm text-gray-600">To: {email.recipient_name || email.recipient_email}</div>
                        <div className="text-xs text-gray-500">{new Date(email.sent_at).toLocaleString()}</div>
                      </div>
                      <div className="text-sm text-gray-500 capitalize">{email.email_type}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
