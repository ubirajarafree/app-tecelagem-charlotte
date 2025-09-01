'use client'

import { useState } from 'react'
import { Usuario } from '@/lib/types'
import { GerenciamentoEstampas } from './gerenciamento-estampas'
import { GerenciamentoPedidos } from './gerenciamento-pedidos'
import { Button } from '@/components/ui/button'
import { Settings, Image, Package } from 'lucide-react'

interface AdminPaginaProps {
  usuario: Usuario
}

type AbaAdmin = 'estampas' | 'pedidos'

export function AdminPagina({ usuario }: AdminPaginaProps) {
  const [abaAtiva, setAbaAtiva] = useState<AbaAdmin>('estampas')

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-purple-100">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-6 w-6 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
            <p className="text-gray-600">Gerencie estampas, pedidos e usuários</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={abaAtiva === 'estampas' ? 'default' : 'ghost'}
            onClick={() => setAbaAtiva('estampas')}
            className={abaAtiva === 'estampas' 
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'text-gray-600 hover:bg-gray-50'
            }
          >
            <Image className="h-4 w-4 mr-2" />
            Estampas
          </Button>
          <Button
            variant={abaAtiva === 'pedidos' ? 'default' : 'ghost'}
            onClick={() => setAbaAtiva('pedidos')}
            className={abaAtiva === 'pedidos' 
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'text-gray-600 hover:bg-gray-50'
            }
          >
            <Package className="h-4 w-4 mr-2" />
            Pedidos
          </Button>
        </div>
      </div>

      {abaAtiva === 'estampas' && <GerenciamentoEstampas usuario={usuario} />}
      {abaAtiva === 'pedidos' && <GerenciamentoPedidos usuario={usuario} />}
    </div>
  )
}