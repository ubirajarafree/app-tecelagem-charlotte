'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Estampa } from '@/lib/types'
import { EstampaCard } from './estampa-card'
import { EstampaDetalhe } from './estampa-detalhe'
import { FiltrosCatalogo } from './filtros-catalogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FiltrosState {
  busca: string
  tags: string[]
  cores: string[]
}

export function CatalogoPagina() {
  const { usuario } = useAuth()
  const [estampas, setEstampas] = useState<Estampa[]>([])
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
    // A lógica condicional vai para DENTRO do hook
    if (usuario) {
      carregarEstampas()
    }
  }, [filtros, usuario]) // Adiciona `usuario` como dependência

  const carregarEstampas = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('estampas')
        .select('*')
        .order('created_at', { ascending: false })

      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase()
        // Filtra no banco de dados pelo nome, código OU descrição
        query = query.or(`nome.ilike.%${busca}%,codigo.ilike.%${busca}%,descricao.ilike.%${busca}%`)
      }

      if (filtros.tags.length > 0) {
        // Filtra estampas que contenham QUALQUER uma das tags selecionadas
        query = query.overlaps('tags', filtros.tags)
      }

      // A filtragem por cor é mais complexa e geralmente requer uma função no banco de dados (RPC).
      // Manteremos a filtragem de cor no cliente por enquanto para simplicidade,
      // mas a maior parte da carga (busca e tags) já foi movida para o servidor.

      const { data, error } = await query

      if (error) throw error

      // Filtro de cor no cliente (se necessário)
      const estampasFiltradasPorCor = aplicarFiltroDeCor(data || [])
      setEstampas(estampasFiltradasPorCor)
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

  const aplicarFiltroDeCor = (data: Estampa[]) => {
    let resultado = data
    if (filtros.cores.length > 0) {
      resultado = resultado.filter(estampa => {
        const cores = Object.values(estampa.paleta_cores)
        return filtros.cores.some(cor => cores.includes(cor))
      })
    }
    return resultado
  }

  // O retorno condicional é movido para DEPOIS de todos os hooks
  if (!usuario) return null

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
              {estampas.length} estampa{estampas.length !== 1 ? 's' : ''} encontrada{estampas.length !== 1 ? 's' : ''}
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

      {estampas.length === 0 && !loading ? (
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
          {estampas.map((estampa) => (
            <EstampaCard
              key={estampa.id}
              estampa={estampa}
              onClick={() => setEstampaSelecionada(estampa)}
            />
          ))}
        </div>
      )}
    </div>
  )
}