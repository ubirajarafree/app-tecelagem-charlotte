'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Usuario, Estampa } from '@/lib/types'
import { EstampaCard } from '@/components/catalogo/estampa-card'
import { EstampaDetalhe } from '@/components/catalogo/estampa-detalhe'
import { Loader2, Heart } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FavoritosPaginaProps {
  usuario: Usuario
}

export function FavoritosPagina({ usuario }: FavoritosPaginaProps) {
  const [estampasFavoritas, setEstampasFavoritas] = useState<Estampa[]>([])
  const [estampaSelecionada, setEstampaSelecionada] = useState<Estampa | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    carregarFavoritos()
  }, [usuario.id])

  const carregarFavoritos = async () => {
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select(`
          estampa:estampas(*)
        `)
        .eq('usuario_id', usuario.id)

      if (error) throw error

      const estampas = data?.map(item => item.estampa).filter(Boolean) as Estampa[] || []
      setEstampasFavoritas(estampas)
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar favoritos',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (estampaSelecionada) {
    return (
      <EstampaDetalhe
        estampa={estampaSelecionada}
        usuario={usuario}
        onVoltar={() => setEstampaSelecionada(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-purple-100">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-800">Meus Favoritos</h1>
        </div>
        <p className="text-gray-600">
          {estampasFavoritas.length} estampa{estampasFavoritas.length !== 1 ? 's' : ''} favorita{estampasFavoritas.length !== 1 ? 's' : ''}
        </p>
      </div>

      {estampasFavoritas.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma estampa favorita</h3>
          <p className="text-gray-600">
            Explore nosso catálogo e marque as estampas que mais gostar como favoritas!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {estampasFavoritas.map((estampa) => (
            <EstampaCard
              key={estampa.id}
              estampa={estampa}
              usuario={usuario}
              onClick={() => setEstampaSelecionada(estampa)}
            />
          ))}
        </div>
      )}
    </div>
  )
}