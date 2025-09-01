'use client'

import { Usuario } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { 
  Grid3X3, 
  Heart, 
  Package, 
  ShoppingCart, 
  User, 
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  usuario: Usuario
  aberta: boolean
  onClose: () => void
  paginaAtual: string
  onNavigate: (pagina: 'catalogo' | 'favoritos' | 'pedidos' | 'carrinho' | 'perfil' | 'admin') => void
}

const menuItems = [
  { id: 'catalogo', label: 'Catálogo', icon: Grid3X3 },
  { id: 'favoritos', label: 'Favoritos', icon: Heart },
  { id: 'pedidos', label: 'Pedidos', icon: Package },
  { id: 'carrinho', label: 'Carrinho', icon: ShoppingCart },
  { id: 'perfil', label: 'Perfil', icon: User },
]

export function Sidebar({ usuario, aberta, onClose, paginaAtual, onNavigate }: SidebarProps) {
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-purple-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Grid3X3 className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-gray-800">Menu</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = paginaAtual === item.id
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start space-x-3 h-11',
                isActive && 'bg-purple-100 text-purple-700 hover:bg-purple-100'
              )}
              onClick={() => onNavigate(item.id as any)}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          )
        })}

        {usuario.role === 'admin' && (
          <>
            <div className="border-t border-purple-100 my-4 pt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  Admin
                </Badge>
              </div>
              <Button
                variant={paginaAtual === 'admin' ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start space-x-3 h-11',
                  paginaAtual === 'admin' && 'bg-purple-100 text-purple-700 hover:bg-purple-100'
                )}
                onClick={() => onNavigate('admin')}
              >
                <Settings className="h-4 w-4" />
                <span>Administração</span>
              </Button>
            </div>
          </>
        )}
      </nav>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-md border-r border-purple-100 shadow-sm transition-transform duration-300 z-40',
        'hidden lg:block w-64',
        !aberta && 'lg:-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={aberta} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0 bg-white/95 backdrop-blur-md">
          {/* Adiciona um título apenas para leitores de tela para cumprir os requisitos de acessibilidade */}
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}