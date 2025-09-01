'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Usuario, Pedido } from '@/lib/types'
import { PedidoCard } from './pedido-card'
import { PedidoDetalhe } from './pedido-detalhe'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Package, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PedidosPaginaProps {
  usuario: Usuario
}

type StatusFiltro = 'todos' | 'processando' | 'concluido' | 'cancelado'

export function PedidosPagina({ usuario }: PedidosPaginaProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('todos')
  const { toast } = useToast()

  useEffect(() => {
    carregarPedidos()
  }, [usuario.id])

  useEffect(() => {
    aplicarFiltro()
  }, [pedidos, statusFiltro])

  const carregarPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          itens:itens_pedido(
            *,
            estampa:estampas(*)
          )
        `)
        .eq('usuario_id', usuario.id)
        .order('data_pedido', { ascending: false })

      if (error) throw error
      setPedidos(data || [])
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar pedidos',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltro = () => {
    if (statusFiltro === 'todos') {
      setPedidosFiltrados(pedidos)
    } else {
      setPedidosFiltrados(pedidos.filter(pedido => pedido.status === statusFiltro))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processando':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Processando</Badge>
      case 'concluido':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Concluído</Badge>
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (pedidoSelecionado) {
    return (
      <PedidoDetalhe
        pedido={pedidoSelecionado}
        usuario={usuario}
        onVoltar={() => setPedidoSelecionado(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-purple-100">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Meus Pedidos</h1>
              <p className="text-gray-600">
                {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <div className="flex gap-1">
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'processando', label: 'Processando' },
                { key: 'concluido', label: 'Concluído' },
                { key: 'cancelado', label: 'Cancelado' },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={statusFiltro === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFiltro(key as StatusFiltro)}
                  className={statusFiltro === key 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFiltro === 'todos' ? 'Nenhum pedido encontrado' : `Nenhum pedido ${statusFiltro}`}
          </h3>
          <p className="text-gray-600">
            {statusFiltro === 'todos' 
              ? 'Explore nosso catálogo e faça seu primeiro pedido!'
              : `Você não possui pedidos com status "${statusFiltro}".`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onClick={() => setPedidoSelecionado(pedido)}
            />
          ))}
        </div>
      )}
    </div>
  )
}