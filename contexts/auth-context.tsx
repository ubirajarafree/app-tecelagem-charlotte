'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { Usuario } from '@/lib/types'
import { Session } from '@supabase/supabase-js'

interface AuthContextType {
  usuario: Usuario | null
  session: Session | null
  loading: boolean
  updateUsuario: (usuario: Usuario) => void
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  session: null,
  loading: true,
  updateUsuario: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      setSession(session)

      if (session?.user) {
        const { data: profile } = await supabase
          .from('usuarios_ext')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUsuario(profile)
      }
      setLoading(false)
    }

    fetchSessionAndProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session?.user) {
          const { data: profile } = await supabase
            .from('usuarios_ext')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setUsuario(profile)
        } else {
          setUsuario(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const updateUsuario = (novoUsuario: Usuario) => {
    setUsuario(novoUsuario)
  }

  const value = { usuario, session, loading, updateUsuario }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)