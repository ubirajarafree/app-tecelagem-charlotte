'use client'

import { Pedido } from '@/lib/types'
import { formatarMoeda } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Calendar, Package } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusBadge } from './status-badge'

interface PedidoCardProps {
  pedido: Pedido
  onClick: () => void
}

export function PedidoCard({ pedido, onClick }: PedidoCardProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Pedido #{pedido.id.slice(-8).toUpperCase()}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(pedido.data_pedido), "d 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <StatusBadge status={pedido.status} />
              <span className="text-sm text-gray-600">
                {pedido.itens?.length || 0} ite{(pedido.itens?.length || 0) !== 1 ? 'ns' : 'm'}
              </span>
              <span className="font-semibold text-lg text-purple-600">
                {formatarMoeda(pedido.valor_total)}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}