import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 max-w-2xl px-4">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">Freelancer Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your invoices, proposals, and clients all in one place</p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
