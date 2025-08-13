"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { User, Building, Bell, Shield, Mail, CheckCircle, SettingsIcon } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface UserProfile {
  id: string
  email: string
  full_name?: string
  company_name?: string
  phone?: string
  website?: string
}

interface NotificationSettings {
  email_notifications: boolean
  invoice_reminders: boolean
  payment_notifications: boolean
  proposal_updates: boolean
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    invoice_reminders: true,
    payment_notifications: true,
    proposal_updates: true,
  })
  const [emailConfigured, setEmailConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Load user profile
      setProfile({
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || "",
        company_name: user.user_metadata?.company_name || "",
        phone: user.user_metadata?.phone || "",
        website: user.user_metadata?.website || "",
      })

      // Check email configuration
      const { data: emailSettings } = await supabase
        .from("email_settings")
        .select("is_configured")
        .eq("user_id", user.id)
        .single()

      setEmailConfigured(emailSettings?.is_configured || false)
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          company_name: profile.company_name,
          phone: profile.phone,
          website: profile.website,
        },
      })

      if (error) {
        console.error("Error updating profile:", error)
        toast.error("Failed to update profile")
        return
      }

      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const updateNotificationSetting = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
    // In a real app, you'd save this to the database
    toast.success("Notification preferences updated")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={profile?.full_name || ""}
                    onChange={(e) => setProfile((prev) => (prev ? { ...prev, full_name: e.target.value } : null))}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={profile?.email || ""} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed from here</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile?.phone || ""}
                    onChange={(e) => setProfile((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profile?.website || ""}
                    onChange={(e) => setProfile((prev) => (prev ? { ...prev, website: e.target.value } : null))}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <Button onClick={saveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Configure your business details for invoices and proposals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={profile?.company_name || ""}
                  onChange={(e) => setProfile((prev) => (prev ? { ...prev, company_name: e.target.value } : null))}
                  placeholder="Your Company Name"
                />
              </div>

              <Button onClick={saveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive general email notifications</p>
                </div>
                <Switch
                  checked={notifications.email_notifications}
                  onCheckedChange={(checked) => updateNotificationSetting("email_notifications", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Invoice Reminders</Label>
                  <p className="text-sm text-gray-500">Get notified about overdue invoices</p>
                </div>
                <Switch
                  checked={notifications.invoice_reminders}
                  onCheckedChange={(checked) => updateNotificationSetting("invoice_reminders", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified when payments are received</p>
                </div>
                <Switch
                  checked={notifications.payment_notifications}
                  onCheckedChange={(checked) => updateNotificationSetting("payment_notifications", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Proposal Updates</Label>
                  <p className="text-sm text-gray-500">Get notified about proposal status changes</p>
                </div>
                <Switch
                  checked={notifications.proposal_updates}
                  onCheckedChange={(checked) => updateNotificationSetting("proposal_updates", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Integration</CardTitle>
              <CardDescription>Configure email settings to send invoices and proposals to clients.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Resend Email Service</h3>
                    <p className="text-sm text-gray-500">Send professional emails to your clients</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {emailConfigured ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Not Configured</Badge>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/settings/email">{emailConfigured ? "Manage" : "Configure"}</Link>
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="text-sm text-gray-600">
                <h4 className="font-medium mb-2">Features:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Send invoices with PDF attachments</li>
                  <li>Send proposals with custom messages</li>
                  <li>Professional email templates</li>
                  <li>Email delivery tracking</li>
                  <li>Custom email signatures</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
              </div>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
