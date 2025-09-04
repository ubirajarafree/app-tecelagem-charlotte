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
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        setSession(session)

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('usuarios_ext')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (profileError) throw profileError
          setUsuario(profile)
        } else {
          setUsuario(null)
        }
      } catch (err) {
        console.error('Erro ao carregar sessão:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSessionAndProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)

        setTimeout(async () => {
          if (session?.user) {
            const { data: profile, error } = await supabase
              .from('usuarios_ext')
              .select('*')
              .eq('id', session.user.id)
              .single()
            if (error) {
              console.error('Erro ao buscar perfil no evento:', error)
              setUsuario(null)
            } else {
              setUsuario(profile)
            }
          } else {
            setUsuario(null)
          }
        }, 0)
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