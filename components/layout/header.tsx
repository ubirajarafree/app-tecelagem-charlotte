'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menu, Scissors, User, LogOut, Grid3X3, Heart, Package, ShoppingCart, Settings } from 'lucide-react'

interface HeaderProps {
  onToggleSidebar: () => void
  paginaAtual: string
  onNavigate: (pagina: 'catalogo' | 'favoritos' | 'pedidos' | 'carrinho' | 'perfil' | 'admin') => void
}

const menuItems = [
  { id: 'catalogo', label: 'Catálogo', icon: Grid3X3 },
  { id: 'favoritos', label: 'Favoritos', icon: Heart },
  { id: 'pedidos', label: 'Pedidos', icon: Package },
  { id: 'carrinho', label: 'Carrinho', icon: ShoppingCart },
]

const adminItem = { id: 'admin', label: 'Admin', icon: Settings }

export function Header({ onToggleSidebar, paginaAtual, onNavigate }: HeaderProps) {
  const { usuario } = useAuth()
  if (!usuario) return null

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const iniciais = usuario.nome_completo
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3 lg:py-5">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleSidebar}
            className="text-purple-600 hover:bg-purple-50 lg:hidden" // Esconde em telas grandes
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Scissors className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Tecelagem Charlotte
            </h1>
          </div>
        </div>

        {/* Menu de Navegação para Desktop */}
        <nav className="hidden lg:flex items-center space-x-2">
          {menuItems.map((item) => {
            const isActive = paginaAtual === item.id
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onNavigate(item.id as any)}
                className={cn(
                  'text-sm font-medium',
                  isActive ? 'text-purple-700' : 'text-gray-600 hover:text-purple-700'
                )}
              >
                {item.label}
              </Button>
            )
          })}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 ring-2 ring-purple-200">
                <AvatarImage src={usuario.avatar_url || ''} alt={usuario.nome_completo} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                  {iniciais}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <div className="flex items-center justify-start space-x-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium text-sm">{usuario.nome_completo}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {usuario.role}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate('perfil')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            {usuario.role === 'admin' && (
              <DropdownMenuItem onClick={() => onNavigate('admin')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Administração
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}