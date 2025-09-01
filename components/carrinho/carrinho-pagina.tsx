'use client'

import { useState } from 'react'
import { Usuario } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Package, CreditCard } from 'lucide-react'

interface CarrinhoPaginaProps {
  usuario: Usuario
}

export function CarrinhoPagina({ usuario }: CarrinhoPaginaProps) {
  // Esta é uma implementação básica - o carrinho seria implementado com estado global ou Context
  const [itensCarrinho, setItensCarrinho] = useState<any[]>([])

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-purple-100">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-6 w-6 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Carrinho de Compras</h1>
            <p className="text-gray-600">
              {itensCarrinho.length} ite{itensCarrinho.length !== 1 ? 'ns' : 'm'} no carrinho
            </p>
          </div>
        </div>
      </div>

      {itensCarrinho.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Seu carrinho está vazio</h3>
          <p className="text-gray-600 mb-4">
            Explore nosso catálogo e adicione estampas ao seu carrinho para começar!
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Explorar Catálogo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Itens do carrinho */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Itens do Carrinho
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Lista de itens seria renderizada aqui */}
              </CardContent>
            </Card>
          </div>

          {/* Resumo */}
          <div>
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Resumo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>R$ 0,00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frete:</span>
                    <span>Grátis</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>R$ 0,00</span>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled>
                    Finalizar Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}