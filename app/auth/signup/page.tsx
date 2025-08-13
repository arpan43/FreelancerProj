import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignupForm from "@/components/signup-form"

export default async function SignupPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-bounce"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-1/2 left-20 w-12 h-12 bg-purple-200 rounded-full opacity-15 animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/2 w-8 h-8 bg-blue-300 rounded-full opacity-25 animate-bounce"></div>

      <SignupForm />
    </div>
  )
}
