"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function ClientForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const saveClient = async () => {
    if (!name) {
      toast({
        title: "Error",
        description: "Client name is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("clients").insert({
        user_id: user?.id,
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        address: address || null,
        notes: notes || null,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Client added successfully",
      })

      router.push("/dashboard/clients")
    } catch (error) {
      console.error("Error saving client:", error)
      toast({
        title: "Error",
        description: "Failed to save client",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Company</label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State 12345"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this client..."
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={saveClient} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Client
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
