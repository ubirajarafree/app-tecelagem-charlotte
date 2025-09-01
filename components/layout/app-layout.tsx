'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Usuario } from '@/lib/types'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { CatalogoPagina } from '@/components/catalogo/catalogo-pagina'
import { FavoritosPagina } from '@/components/favoritos/favoritos-pagina'
import { PedidosPagina } from '@/components/pedidos/pedidos-pagina'
import { CarrinhoPagina } from '@/components/carrinho/carrinho-pagina'
import { PerfilPagina } from '@/components/perfil/perfil-pagina'
import { AdminPagina } from '@/components/admin/admin-pagina'
import { Loader2 } from 'lucide-react'

type PaginaAtual = 'catalogo' | 'favoritos' | 'pedidos' | 'carrinho' | 'perfil' | 'admin'

export function AppLayout() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [paginaAtual, setPaginaAtual] = useState<PaginaAtual>('catalogo')
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('usuarios_ext')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setUsuario(data)
        } else {
          // Criar registro na tabela estendida se não existir
          const novoUsuario = {
            id: user.id,
            nome_completo: user.user_metadata.nome_completo || user.email || '',
            avatar_url: user.user_metadata.avatar_url || null,
            role: user.user_metadata.role || 'cliente'
          }
          
          const { data: usuarioCriado } = await supabase
            .from('usuarios_ext')
            .insert([novoUsuario])
            .select()
            .single()
          
          setUsuario(usuarioCriado || novoUsuario)
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarUsuario()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!usuario) return null

  const renderPagina = () => {
    switch (paginaAtual) {
      case 'catalogo':
        return <CatalogoPagina usuario={usuario} />
      case 'favoritos':
        return <FavoritosPagina usuario={usuario} />
      case 'pedidos':
        return <PedidosPagina usuario={usuario} />
      case 'carrinho':
        return <CarrinhoPagina usuario={usuario} />
      case 'perfil':
        return <PerfilPagina usuario={usuario} setUsuario={setUsuario} />
      case 'admin':
        return usuario.role === 'admin' ? <AdminPagina usuario={usuario} /> : <CatalogoPagina usuario={usuario} />
      default:
        return <CatalogoPagina usuario={usuario} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Header 
        usuario={usuario} 
        onToggleSidebar={() => setSidebarAberta(!sidebarAberta)} 
      />
      
      <Sidebar 
        usuario={usuario}
        aberta={sidebarAberta}
        onClose={() => setSidebarAberta(false)}
        paginaAtual={paginaAtual}
        onNavigate={(pagina) => {
          setPaginaAtual(pagina)
          setSidebarAberta(false)
        }}
      />
      
      <main className={`transition-all duration-300 pt-16 ${sidebarAberta ? 'lg:ml-64' : 'ml-0'}`}>
        <div className="p-6">
          {renderPagina()}
        </div>
      </main>
    </div>
  )
}