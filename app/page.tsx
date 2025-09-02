'use client'

import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { AuthForm } from '@/components/auth/auth-form'
import { AppLayout } from '@/components/layout/app-layout'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!session) {
    return <AuthForm />
  }

  return <AppLayout />
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}