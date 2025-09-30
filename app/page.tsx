import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  GraduationCap,
  Users,
  CreditCard,
  BookOpen,
  TrendingUp,
  Shield,
  Check,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">LCMS</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              Log in
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button className="rounded-full bg-black px-6 text-white hover:bg-gray-800">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        {/* New Badge */}
        <div className="mb-8 inline-flex items-center rounded-full bg-black px-4 py-2 text-sm text-white">
          <span className="mr-3 rounded-full bg-white px-2 py-1 text-xs text-black">New</span>
          Streamline your educational management
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <h1 className="mb-6 text-balance text-5xl font-bold text-gray-900 md:text-6xl">
          Manage your students with <span className="text-blue-500">confidence</span>
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-gray-600">
          Streamline student enrollment, organize groups efficiently, and manage subscriptions
          seamlessly. Everything you need to run your educational center in one powerful platform.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/auth/sign-up">
            <Button className="rounded-full bg-black px-8 py-3 text-white hover:bg-gray-800">
              <Star className="mr-2 h-4 w-4" />
              Get Started - It's Free
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="rounded-full bg-transparent px-8 py-3">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Logo Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center space-x-12 opacity-60">
            <div className="text-2xl font-bold">Nextjs</div>
            <div className="text-2xl font-bold ">n8n</div>
            <div className="text-2xl font-bold">Supabase</div>
            <div className="text-2xl font-bold">Vercel</div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="px-6 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="relative mx-auto mb-6 h-16 w-16 overflow-hidden rounded-full bg-gray-200">
            <Image
              src="/placeholder-user.jpg"
              alt="Sarah from ALZahraa Center testimonial"
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <h3 className="mb-4 text-xl font-semibold">Quick and Easy Setup</h3>
          <p className="mb-2 text-gray-600">
            "We've managed hundreds of students efficiently. The platform's dashboard is the only
            thing that keeps us organized."
          </p>
          <p className="text-sm text-gray-500">Sarah from ALZahraa Center</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm text-gray-500">Features</p>
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Everything you need to manage your center
            </h2>
            <p className="text-gray-600">
              Powerful tools designed specifically for educational institutions
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Users className="mb-4 h-12 w-12 text-primary" />
                <CardTitle>Student Management</CardTitle>
                <CardDescription>
                  Keep track of all your students with detailed profiles, contact information, and
                  enrollment status.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <BookOpen className="mb-4 h-12 w-12 text-primary" />
                <CardTitle>Group Organization</CardTitle>
                <CardDescription>
                  Organize students into groups, manage class sizes, and track group performance
                  efficiently.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CreditCard className="mb-4 h-12 w-12 text-primary" />
                <CardTitle>Subscription Tracking</CardTitle>
                <CardDescription>
                  Monitor subscription plans, payment status, and billing cycles with automated
                  reminders.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <TrendingUp className="mb-4 h-12 w-12 text-primary" />
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Get insights into enrollment trends, revenue patterns, and student engagement
                  metrics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Shield className="mb-4 h-12 w-12 text-primary" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your data is protected with enterprise-grade security and privacy controls.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <GraduationCap className="mb-4 h-12 w-12 text-primary" />
                <CardTitle>Easy to Use</CardTitle>
                <CardDescription>
                  Intuitive interface designed for educators, not tech experts. Get started in
                  minutes.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Email Features Section */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="mb-6 text-3xl font-bold text-gray-900">
              Management That Feels
              <br />
              Effortless
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Check className="mr-3 h-5 w-5 text-green-500" />
                <span>Track student progress and attendance</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-3 h-5 w-5 text-green-500" />
                <span>Organize classes and study groups</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-3 h-5 w-5 text-green-500" />
                <span>Manage subscriptions and payments</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-3 h-5 w-5 text-green-500" />
                <span>Generate reports and analytics</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="h-96 w-80 rounded-2xl bg-gray-100 p-4 shadow-lg">
              <div className="flex h-full flex-col rounded-xl bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-xs">LCMS</div>
                  <div className="flex space-x-1">
                    <div className="h-1 w-1 rounded-full bg-black"></div>
                    <div className="h-1 w-1 rounded-full bg-black"></div>
                    <div className="h-1 w-1 rounded-full bg-black"></div>
                  </div>
                </div>
                <div className="mb-2 text-sm font-medium">
                  Your students are making great progress!
                </div>
                <div className="mb-4 text-xs text-gray-500">12 new enrollments this week</div>
                <div className="flex-1 rounded-lg bg-gray-50 p-3">
                  <div className="mb-2 text-lg font-bold">Dashboard</div>
                  <div className="mb-2 text-sm">Active Students: 156</div>
                  <div className="mb-2 text-sm">Groups: 8</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div className="text-xs">Manage your educational center efficiently</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-2xl bg-primary/5 p-8 md:p-12">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to transform your educational management?
            </h2>
            <p className="mb-8 text-lg text-gray-600">
              Join hundreds of educational centers already using our platform to streamline their
              operations.
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-black px-8 text-lg text-white hover:bg-gray-800">
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-semibold">LCMS</span>
            </div>
            <p className="text-sm text-gray-500">© 2025 LCMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
