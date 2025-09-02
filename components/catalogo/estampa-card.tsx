'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Usuario, Estampa } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface EstampaCardProps {
  estampa: Estampa
  onClick: () => void
}

export function EstampaCard({ estampa, onClick }: EstampaCardProps) {
  const { usuario } = useAuth()
  const [favorita, setFavorita] = useState(false)
  const [loadingFavorito, setLoadingFavorito] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    verificarFavorito()
  }, [estampa.id, usuario?.id])

  const verificarFavorito = async () => {
    if (!usuario) return
    try {
      const { data } = await supabase
        .from('favoritos')
        .select('*')
        .eq('usuario_id', usuario?.id)
        .eq('estampa_id', estampa.id)
        .single()

      setFavorita(!!data)
    } catch (error) {
      // Não é favorito
    }
  }

  const toggleFavorito = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setLoadingFavorito(true)
    if (!usuario) return

    try {
      if (favorita) {
        await supabase
          .from('favoritos')
          .delete()
          .eq('usuario_id', usuario.id)
          .eq('estampa_id', estampa.id)
        
        setFavorita(false)
        toast({
          title: 'Removido dos favoritos',
          description: `${estampa.nome} foi removido dos seus favoritos.`,
        })
      } else {
        await supabase
          .from('favoritos')
          .insert([{
            usuario_id: usuario.id,
            estampa_id: estampa.id
          }])
        
        setFavorita(true)
        toast({
          title: 'Adicionado aos favoritos',
          description: `${estampa.nome} foi adicionado aos seus favoritos.`,
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoadingFavorito(false)
    }
  }

  const adicionarAoCarrinho = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implementar carrinho
    toast({
      title: 'Adicionado ao carrinho',
      description: `${estampa.nome} foi adicionado ao carrinho.`,
    })
  }

  return (
    <Card className="group cursor-pointer bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <img
          src={estampa.imagem_url || 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg'}
          alt={estampa.nome}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className={cn(
              "h-8 w-8 p-0 bg-white/90 hover:bg-white border-0 shadow-sm transition-colors duration-200",
              favorita && "text-red-500 hover:text-red-600"
            )}
            onClick={toggleFavorito}
            disabled={loadingFavorito}
          >
            <Heart className={cn("h-4 w-4", favorita && "fill-current")} />
          </Button>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            className="flex-1 bg-white/90 hover:bg-white text-gray-800 border-0 shadow-sm"
            onClick={onClick}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 shadow-sm"
            onClick={adicionarAoCarrinho}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-3" onClick={onClick}>
        <div>
          <h3 className="font-semibold text-gray-800 line-clamp-1">{estampa.nome}</h3>
          <p className="text-sm text-gray-500 font-mono">{estampa.codigo}</p>
        </div>

        {estampa.tags && estampa.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {estampa.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-purple-50 text-purple-700">
                {tag}
              </Badge>
            ))}
            {estampa.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-500">
                +{estampa.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {estampa.paleta_cores && Object.keys(estampa.paleta_cores).length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Cores:</span>
            <div className="flex gap-1">
              {Object.values(estampa.paleta_cores).slice(0, 4).map((cor, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}