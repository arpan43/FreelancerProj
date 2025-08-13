import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Users,
  BarChart3,
  CreditCard,
  Zap,
  Shield,
  Star,
  Mail,
  Phone,
  DollarSign,
  Globe,
  Smartphone,
  Cloud,
  ChevronDown,
  Play,
} from "lucide-react"

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  const testimonials1 = [
    {
      name: "Sarah Johnson",
      role: "Graphic Designer",
      avatar: "S",
      color: "bg-blue-500",
      review:
        "FreelancerPro has completely transformed how I manage my business. The AI proposals save me hours every week and my win rate has increased by 40%!",
      gradient: "from-blue-50 to-white",
    },
    {
      name: "Mike Chen",
      role: "Web Developer",
      avatar: "M",
      color: "bg-green-500",
      review:
        "The invoicing system is incredibly intuitive. I get paid 40% faster now with automated reminders. Best investment for my freelance business!",
      gradient: "from-green-50 to-white",
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Consultant",
      avatar: "E",
      color: "bg-purple-500",
      review:
        "The analytics dashboard gives me insights I never had before. I can see exactly which clients are most profitable and plan accordingly.",
      gradient: "from-purple-50 to-white",
    },
    {
      name: "David Kim",
      role: "UX Designer",
      avatar: "D",
      color: "bg-orange-500",
      review:
        "Client management has never been easier. I can track all communications, project status, and payments in one place. Highly recommended!",
      gradient: "from-orange-50 to-white",
    },
    {
      name: "Lisa Wang",
      role: "Content Writer",
      avatar: "L",
      color: "bg-teal-500",
      review:
        "The payment processing is seamless. My clients love the easy payment links and I love getting paid faster. Win-win situation!",
      gradient: "from-teal-50 to-white",
    },
    {
      name: "James Miller",
      role: "Photographer",
      avatar: "J",
      color: "bg-red-500",
      review:
        "As a photographer, I need professional invoices that reflect my brand. The customization options are perfect and my clients are impressed.",
      gradient: "from-red-50 to-white",
    },
    {
      name: "Anna Thompson",
      role: "Freelance Writer",
      avatar: "A",
      color: "bg-indigo-500",
      review:
        "The proposal templates are amazing! I can create professional proposals in minutes instead of hours. My clients are always impressed.",
      gradient: "from-indigo-50 to-white",
    },
    {
      name: "Robert Davis",
      role: "Digital Marketer",
      avatar: "R",
      color: "bg-pink-500",
      review:
        "Time tracking and project management features keep me organized. I've never been more productive in my freelance career.",
      gradient: "from-pink-50 to-white",
    },
    {
      name: "Maria Garcia",
      role: "Brand Designer",
      avatar: "M",
      color: "bg-yellow-500",
      review:
        "The custom branding options let me create invoices that truly represent my brand. Professional and beautiful every time.",
      gradient: "from-yellow-50 to-white",
    },
    {
      name: "Kevin Lee",
      role: "App Developer",
      avatar: "K",
      color: "bg-cyan-500",
      review:
        "Integration with my existing tools was seamless. Everything syncs perfectly and I have all my data in one place.",
      gradient: "from-cyan-50 to-white",
    },
    {
      name: "Sophie Brown",
      role: "Social Media Specialist",
      avatar: "S",
      color: "bg-emerald-500",
      review: "The mobile app is fantastic! I can manage my business on the go and never miss a payment or deadline.",
      gradient: "from-emerald-50 to-white",
    },
    {
      name: "Daniel Wilson",
      role: "Video Producer",
      avatar: "D",
      color: "bg-rose-500",
      review:
        "Client communication tools are excellent. I can share project updates and get approvals faster than ever before.",
      gradient: "from-rose-50 to-white",
    },
  ]

  const testimonials2 = [
    {
      name: "Alex Thompson",
      role: "Software Developer",
      avatar: "A",
      color: "bg-indigo-500",
      review:
        "The time tracking and project management features help me stay organized and deliver projects on time. My productivity has increased significantly.",
      gradient: "from-indigo-50 to-white",
    },
    {
      name: "Rachel Green",
      role: "Social Media Manager",
      avatar: "R",
      color: "bg-pink-500",
      review:
        "Customer support is outstanding! They helped me migrate all my data and set up everything perfectly. The team really cares about their users.",
      gradient: "from-pink-50 to-white",
    },
    {
      name: "Tom Wilson",
      role: "Copywriter",
      avatar: "T",
      color: "bg-yellow-500",
      review:
        "I've tried many freelance management tools, but FreelancerPro is by far the most comprehensive and user-friendly. It has everything I need.",
      gradient: "from-yellow-50 to-white",
    },
    {
      name: "Nina Patel",
      role: "Video Editor",
      avatar: "N",
      color: "bg-cyan-500",
      review:
        "The mobile app is fantastic! I can create invoices, check payments, and manage clients on the go. Perfect for busy freelancers like me.",
      gradient: "from-cyan-50 to-white",
    },
    {
      name: "Carlos Martinez",
      role: "Business Consultant",
      avatar: "C",
      color: "bg-emerald-500",
      review:
        "The reporting features give me clear insights into my business performance. I can make data-driven decisions and grow my freelance business strategically.",
      gradient: "from-emerald-50 to-white",
    },
    {
      name: "Jessica Taylor",
      role: "UI/UX Designer",
      avatar: "J",
      color: "bg-purple-500",
      review:
        "The design templates are beautiful and professional. My clients always comment on how polished my invoices and proposals look.",
      gradient: "from-purple-50 to-white",
    },
    {
      name: "Mark Anderson",
      role: "SEO Specialist",
      avatar: "M",
      color: "bg-blue-500",
      review:
        "Automated reminders have been a game-changer. I get paid 50% faster and spend less time chasing payments.",
      gradient: "from-blue-50 to-white",
    },
    {
      name: "Laura White",
      role: "Content Strategist",
      avatar: "L",
      color: "bg-green-500",
      review:
        "The AI proposal feature is incredible. It understands my business and creates proposals that win more clients.",
      gradient: "from-green-50 to-white",
    },
    {
      name: "Chris Johnson",
      role: "Web Designer",
      avatar: "C",
      color: "bg-orange-500",
      review:
        "Project collaboration features make working with clients smooth. Everyone stays updated and projects finish on time.",
      gradient: "from-orange-50 to-white",
    },
    {
      name: "Amanda Clark",
      role: "Marketing Manager",
      avatar: "A",
      color: "bg-teal-500",
      review:
        "The analytics help me understand which services are most profitable. I've optimized my pricing and increased revenue by 30%.",
      gradient: "from-teal-50 to-white",
    },
    {
      name: "Ryan Mitchell",
      role: "Freelance Developer",
      avatar: "R",
      color: "bg-red-500",
      review:
        "Security features give me peace of mind. My client data is safe and I can focus on delivering great work.",
      gradient: "from-red-50 to-white",
    },
    {
      name: "Emma Davis",
      role: "Brand Consultant",
      avatar: "E",
      color: "bg-violet-500",
      review:
        "The customization options are endless. I can create branded experiences that wow my clients every single time.",
      gradient: "from-violet-50 to-white",
    },
  ]

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">FreelancerPro</h1>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Testimonials
              </a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Contact
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" className="font-medium">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 font-medium">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100 font-medium">
              ✨ New: AI-Powered Proposal Generation
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Manage Your Freelance
              <span className="text-blue-600 block">Business Like a Pro</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
              Streamline your invoicing, proposals, and client management with our all-in-one platform. Get paid faster,
              work smarter, and grow your freelance business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4 font-semibold">
                <Link href="/auth/signup" className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent font-semibold">
                <Link href="#demo" className="flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="font-medium">14-day free trial</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              Powerful tools designed specifically for freelancers and small businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="font-semibold">Smart Invoicing</CardTitle>
                <CardDescription className="font-medium">
                  Create professional invoices in seconds with customizable templates and automated reminders
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="font-semibold">AI Proposals</CardTitle>
                <CardDescription className="font-medium">
                  Generate winning proposals using AI that understands your business and client needs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="font-semibold">Client Management</CardTitle>
                <CardDescription className="font-medium">
                  Keep track of all your clients, projects, and communications in one organized place
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="font-semibold">Analytics Dashboard</CardTitle>
                <CardDescription className="font-medium">
                  Track your revenue, monitor payment status, and get insights into your business performance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="font-semibold">Payment Processing</CardTitle>
                <CardDescription className="font-medium">
                  Accept payments online with secure payment links and automatic payment tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle className="font-semibold">Secure & Reliable</CardTitle>
                <CardDescription className="font-medium">
                  Bank-level security with automatic backups and 99.9% uptime guarantee
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-blue-100 font-medium">Active Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">$2M+</div>
              <div className="text-blue-100 font-medium">Invoices Processed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-blue-100 font-medium">Uptime</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100 font-medium">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 font-medium">Choose the plan that fits your business needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-gray-600 font-medium">/month</span>
                </div>
                <CardDescription className="mt-4 font-medium">Perfect for new freelancers</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">Up to 10 invoices/month</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">5 clients</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">Basic templates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">Email support</span>
                  </li>
                </ul>
                <Button className="w-full bg-transparent font-semibold" variant="outline">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-2 border-blue-500 relative hover:border-blue-600 transition-colors">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white font-semibold">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">Professional</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-gray-600 font-medium">/month</span>
                </div>
                <CardDescription className="mt-4 font-medium">For growing freelance businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">Unlimited invoices</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">Unlimited clients</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">AI proposal generation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">Priority support</span>
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 font-semibold">Start Free Trial</Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-gray-600 font-medium">/month</span>
                </div>
                <CardDescription className="mt-4 font-medium">For agencies and teams</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">Everything in Professional</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">Team collaboration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">Custom branding</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">API access</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium">24/7 phone support</span>
                  </li>
                </ul>
                <Button className="w-full bg-transparent font-semibold" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 font-medium">Get started in minutes, not hours</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Sign Up & Setup</h3>
              <p className="text-gray-600 font-medium">
                Create your account in seconds and customize your profile with your business information and branding.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Add Clients & Projects</h3>
              <p className="text-gray-600 font-medium">
                Import your existing clients or add new ones. Create projects and start tracking your work immediately.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Invoice & Get Paid</h3>
              <p className="text-gray-600 font-medium">
                Generate professional invoices, send them to clients, and get paid faster with automated reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Integrates With Your Favorite Tools</h2>
            <p className="text-xl text-gray-600 font-medium">Connect with the tools you already use</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Cloud className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 font-medium">Everything you need to know about FreelancerPro</p>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg font-semibold">
                  How does the AI proposal generation work?
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-medium">
                  Our AI analyzes your project requirements, client information, and industry best practices to generate
                  professional, customized proposals that increase your win rate.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg font-semibold">
                  Can I customize invoice templates?
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-medium">
                  Yes! Choose from multiple professional templates and customize colors, fonts, logos, and layout to
                  match your brand perfectly.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg font-semibold">
                  What payment methods do you support?
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-medium">
                  We support all major payment methods including credit cards, PayPal, bank transfers, and digital
                  wallets through secure payment links.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg font-semibold">
                  Is my data secure?
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-medium">
                  Absolutely. We use bank-level encryption, regular security audits, and comply with GDPR and SOC 2
                  standards to keep your data safe.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section with Seamless Sliding Cards */}
      <section id="testimonials" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by Freelancers Worldwide</h2>
            <p className="text-xl text-gray-600 font-medium">Join thousands of satisfied customers</p>
          </div>

          {/* First Row - Moving Right */}
          <div className="relative mb-8">
            <div className="flex animate-scroll-right-seamless space-x-4">
              {/* Original testimonials */}
              {testimonials1.map((testimonial, index) => (
                <Card
                  key={`original-1-${index}`}
                  className={`min-w-[320px] max-w-[320px] flex-shrink-0 border-0 shadow-md bg-gradient-to-br ${testimonial.gradient}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 font-medium text-sm leading-relaxed">"{testimonial.review}"</p>
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 ${testimonial.color} rounded-full flex items-center justify-center text-white font-semibold mr-3 text-sm`}
                      >
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{testimonial.name}</div>
                        <div className="text-xs text-gray-500 font-medium">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Duplicate testimonials for seamless loop */}
              {testimonials1.map((testimonial, index) => (
                <Card
                  key={`duplicate-1-${index}`}
                  className={`min-w-[320px] max-w-[320px] flex-shrink-0 border-0 shadow-md bg-gradient-to-br ${testimonial.gradient}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 font-medium text-sm leading-relaxed">"{testimonial.review}"</p>
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 ${testimonial.color} rounded-full flex items-center justify-center text-white font-semibold mr-3 text-sm`}
                      >
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{testimonial.name}</div>
                        <div className="text-xs text-gray-500 font-medium">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Second Row - Moving Left */}
          <div className="relative">
            <div className="flex animate-scroll-left-seamless space-x-4">
              {/* Original testimonials */}
              {testimonials2.map((testimonial, index) => (
                <Card
                  key={`original-2-${index}`}
                  className={`min-w-[320px] max-w-[320px] flex-shrink-0 border-0 shadow-md bg-gradient-to-br ${testimonial.gradient}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 font-medium text-sm leading-relaxed">"{testimonial.review}"</p>
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 ${testimonial.color} rounded-full flex items-center justify-center text-white font-semibold mr-3 text-sm`}
                      >
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{testimonial.name}</div>
                        <div className="text-xs text-gray-500 font-medium">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Duplicate testimonials for seamless loop */}
              {testimonials2.map((testimonial, index) => (
                <Card
                  key={`duplicate-2-${index}`}
                  className={`min-w-[320px] max-w-[320px] flex-shrink-0 border-0 shadow-md bg-gradient-to-br ${testimonial.gradient}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 font-medium text-sm leading-relaxed">"{testimonial.review}"</p>
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 ${testimonial.color} rounded-full flex items-center justify-center text-white font-semibold mr-3 text-sm`}
                      >
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{testimonial.name}</div>
                        <div className="text-xs text-gray-500 font-medium">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Freelance Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 font-medium">
            Join thousands of freelancers who are already growing their business with FreelancerPro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 font-semibold"
            >
              <Link href="/auth/signup" className="flex items-center">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 bg-transparent font-semibold"
            >
              <Link href="#contact">Talk to Sales</Link>
            </Button>
          </div>
          <p className="text-blue-200 mt-4 text-sm font-medium">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <h3 className="text-2xl font-bold mb-4">FreelancerPro</h3>
              <p className="text-gray-400 mb-6 font-medium">
                The complete solution for freelancers to manage their business professionally.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white transition-colors font-medium">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors font-medium">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors font-medium">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors font-medium">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors font-medium">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors font-medium">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors font-medium">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors font-medium">
                    Press
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors font-medium">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors font-medium">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors font-medium">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors font-medium">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm font-medium">© 2024 FreelancerPro. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm font-medium">Made with ❤️ for freelancers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
