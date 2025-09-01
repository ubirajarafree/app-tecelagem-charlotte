'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Usuario, Estampa } from '@/lib/types'
import { EstampaCard } from './estampa-card'
import { EstampaDetalhe } from './estampa-detalhe'
import { FiltrosCatalogo } from './filtros-catalogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CatalogoPaginaProps {
  usuario: Usuario
}

interface FiltrosState {
  busca: string
  tags: string[]
  cores: string[]
}

export function CatalogoPagina({ usuario }: CatalogoPaginaProps) {
  const [estampas, setEstampas] = useState<Estampa[]>([])
  const [estampasFiltradas, setEstampasFiltradas] = useState<Estampa[]>([])
  const [estampaSelecionada, setEstampaSelecionada] = useState<Estampa | null>(null)
  const [loading, setLoading] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosState>({
    busca: '',
    tags: [],
    cores: []
  })
  const { toast } = useToast()

  useEffect(() => {
    carregarEstampas()
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [estampas, filtros])

  const carregarEstampas = async () => {
    try {
      const { data, error } = await supabase
        .from('estampas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEstampas(data || [])
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar estampas',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = () => {
    let resultado = [...estampas]

    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase()
      resultado = resultado.filter(estampa => 
        estampa.nome.toLowerCase().includes(busca) ||
        estampa.codigo.toLowerCase().includes(busca) ||
        estampa.descricao.toLowerCase().includes(busca)
      )
    }

    if (filtros.tags.length > 0) {
      resultado = resultado.filter(estampa =>
        filtros.tags.some(tag => estampa.tags.includes(tag))
      )
    }

    if (filtros.cores.length > 0) {
      resultado = resultado.filter(estampa => {
        const cores = Object.values(estampa.paleta_cores)
        return filtros.cores.some(cor => cores.includes(cor))
      })
    }

    setEstampasFiltradas(resultado)
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
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Catálogo de Estampas</h1>
            <p className="text-gray-600 mt-1">
              {estampasFiltradas.length} estampa{estampasFiltradas.length !== 1 ? 's' : ''} encontrada{estampasFiltradas.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, código ou descrição..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                className="pl-10 border-gray-200 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <FiltrosCatalogo
              estampas={estampas}
              filtros={filtros}
              onFiltrosChange={setFiltros}
            />
          </div>
        )}
      </div>

      {estampasFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma estampa encontrada</h3>
          <p className="text-gray-600 mb-4">
            Tente ajustar os filtros ou termos de busca para encontrar o que procura.
          </p>
          <Button
            variant="outline"
            onClick={() => setFiltros({ busca: '', tags: [], cores: [] })}
            className="border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {estampasFiltradas.map((estampa) => (
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