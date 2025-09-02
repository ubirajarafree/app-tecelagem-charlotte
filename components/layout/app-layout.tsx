'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { CatalogoPagina } from '@/components/catalogo/catalogo-pagina'
import { FavoritosPagina } from '@/components/favoritos/favoritos-pagina'
import { PedidosPagina } from '@/components/pedidos/pedidos-pagina'
import { CarrinhoPagina } from '@/components/carrinho/carrinho-pagina'
import { PerfilPagina } from '@/components/perfil/perfil-pagina'
import { AdminPagina } from '@/components/admin/admin-pagina'

type PaginaAtual = 'catalogo' | 'favoritos' | 'pedidos' | 'carrinho' | 'perfil' | 'admin'

export function AppLayout() {
  const { usuario } = useAuth()
  const [paginaAtual, setPaginaAtual] = useState<PaginaAtual>('catalogo')
  const [sidebarAberta, setSidebarAberta] = useState(false)

  if (!usuario) return null

  const handleNavigate = (pagina: PaginaAtual) => {
    setPaginaAtual(pagina)
    setSidebarAberta(false) // Fecha o sidebar ao navegar em mobile
  }

  const renderPagina = () => {
    switch (paginaAtual) {
      case 'catalogo':
        return <CatalogoPagina />
      case 'favoritos':
        return <FavoritosPagina />
      case 'pedidos':
        return <PedidosPagina />
      case 'carrinho':
        return <CarrinhoPagina />
      case 'perfil':
        return <PerfilPagina />
      case 'admin':
        return usuario.role === 'admin' ? <AdminPagina /> : <CatalogoPagina />
      default:
        return <CatalogoPagina />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Header 
        onToggleSidebar={() => setSidebarAberta(!sidebarAberta)}
        paginaAtual={paginaAtual}
        onNavigate={handleNavigate}
      />
      
      <Sidebar 
        aberta={sidebarAberta}
        onClose={() => setSidebarAberta(false)}
        paginaAtual={paginaAtual}
        onNavigate={handleNavigate}
      />
      
      <main className="pt-16">
        <div className="p-6">
          {renderPagina()}
        </div>
      </main>
    </div>
  )
}