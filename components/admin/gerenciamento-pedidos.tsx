'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Pedido } from '@/lib/types'
import { formatarMoeda } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search, Package, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusBadge } from '../pedidos/status-badge'

export function GerenciamentoPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
  const [loading, setLoading] = useState(true)
  const { usuario } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    carregarPedidos()
  }, [busca, statusFiltro]) // Recarrega os dados quando os filtros mudam

  const carregarPedidos = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          usuario:usuarios_ext(nome_completo),
          itens:itens_pedido(
            *,
            estampa:estampas(*)
          )
        `)
        .order('data_pedido', { ascending: false })

      if (statusFiltro !== 'todos') {
        query = query.eq('status', statusFiltro)
      }

      if (busca) {
        // Filtra no banco de dados pelo ID do pedido OU pelo nome do cliente
        query = query.or(`id.ilike.%${busca}%,usuario.nome_completo.ilike.%${busca}%`)
      }

      const { data, error } = await query

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

  const atualizarStatus = async (pedidoId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: novoStatus })
        .eq('id', pedidoId)

      if (error) throw error

      setPedidos(prev => prev.map(p => 
        p.id === pedidoId ? { ...p, status: novoStatus as Pedido['status'] } : p
      ))

      toast({
        title: 'Status atualizado',
        description: `O pedido foi marcado como "${novoStatus}".`,
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gerenciamento de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por ID do pedido ou cliente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10 border-gray-200 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-48 border-gray-200">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="processando">Processando</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id} className="bg-white hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">
                      #{pedido.id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {pedido.usuario?.nome_completo || 'Usuário não encontrado'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(pedido.data_pedido), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {pedido.itens?.length || 0} ite{(pedido.itens?.length || 0) !== 1 ? 'ns' : 'm'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={pedido.status} />
                    </TableCell>
                    <TableCell className="font-semibold text-purple-600">
                      {formatarMoeda(pedido.valor_total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={pedido.status}
                        onValueChange={(valor) => atualizarStatus(pedido.id, valor)}
                      >
                        <SelectTrigger className="w-32 h-8 border-gray-200 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="processando">Processando</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {pedidos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhum pedido encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}