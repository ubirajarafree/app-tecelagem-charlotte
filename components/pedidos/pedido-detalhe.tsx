'use client'

import { useAuth } from '@/contexts/auth-context'
import { Pedido } from '@/lib/types'
import { formatarMoeda } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, Package, MapPin, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusBadge } from './status-badge'

interface PedidoDetalheProps {
  pedido: Pedido
  onVoltar: () => void
}

export function PedidoDetalhe({ pedido, onVoltar }: PedidoDetalheProps) {
  const { usuario } = useAuth()

  const calcularSubtotal = () => {
    return pedido.itens?.reduce((total, item) => total + (item.quantidade * item.preco_unitario), 0) || 0
  }

  if (!usuario) return null

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onVoltar}
        className="mb-4 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar aos pedidos
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do pedido */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-purple-600" />
                  Pedido #{pedido.id.slice(-8).toUpperCase()}
                </CardTitle>
                <StatusBadge status={pedido.status} />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Realizado em {format(new Date(pedido.data_pedido), "d 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            </CardHeader>
          </Card>

          {/* Itens do pedido */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardHeader>
              <CardTitle>Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pedido.itens?.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.estampa?.imagem_url || 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg'}
                        alt={item.estampa?.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.estampa?.nome}</h4>
                      <p className="text-sm text-gray-600 font-mono">{item.estampa?.codigo}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Quantidade: <span className="font-medium">{item.quantidade}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {formatarMoeda(item.preco_unitario)} × {item.quantidade}
                          </div>
                          <div className="font-medium text-purple-600">
                            {formatarMoeda(item.quantidade * item.preco_unitario)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-center text-gray-500 py-4">
                  Nenhum item encontrado neste pedido.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo do pedido */}
        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatarMoeda(calcularSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frete:</span>
                <span>Grátis</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span className="text-purple-600">{formatarMoeda(pedido.valor_total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Informações de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-800">{usuario.nome_completo}</span>
                </div>
                <div className="text-gray-600">
                  Endereço não disponível
                </div>
                <div className="text-gray-600">
                  Prazo de entrega: 7-10 dias úteis
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}