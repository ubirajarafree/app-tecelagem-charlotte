'use client'

import { useState, useEffect } from 'react'
import { Estampa } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface FiltrosCatalogoProps {
  estampas: Estampa[]
  filtros: {
    busca: string
    tags: string[]
    cores: string[]
  }
  onFiltrosChange: (filtros: any) => void
}

export function FiltrosCatalogo({ estampas, filtros, onFiltrosChange }: FiltrosCatalogoProps) {
  const [tagsDisponiveis, setTagsDisponiveis] = useState<string[]>([])
  const [coresDisponiveis, setCoresDisponiveis] = useState<string[]>([])

  useEffect(() => {
    // Extrair todas as tags únicas
    const tags = new Set<string>()
    const cores = new Set<string>()

    estampas.forEach(estampa => {
      if (estampa.tags) {
        estampa.tags.forEach(tag => tags.add(tag))
      }
      if (estampa.paleta_cores) {
        Object.values(estampa.paleta_cores).forEach(cor => cores.add(cor))
      }
    })

    setTagsDisponiveis(Array.from(tags).sort())
    setCoresDisponiveis(Array.from(cores).sort())
  }, [estampas])

  const toggleTag = (tag: string) => {
    const novasTags = filtros.tags.includes(tag)
      ? filtros.tags.filter(t => t !== tag)
      : [...filtros.tags, tag]
    
    onFiltrosChange({ ...filtros, tags: novasTags })
  }

  const toggleCor = (cor: string) => {
    const novasCores = filtros.cores.includes(cor)
      ? filtros.cores.filter(c => c !== cor)
      : [...filtros.cores, cor]
    
    onFiltrosChange({ ...filtros, cores: novasCores })
  }

  const limparFiltros = () => {
    onFiltrosChange({ busca: filtros.busca, tags: [], cores: [] })
  }

  const temFiltrosAtivos = filtros.tags.length > 0 || filtros.cores.length > 0

  return (
    <div className="space-y-4">
      {temFiltrosAtivos && (
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">Filtros ativos:</span>
          {filtros.tags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
          {filtros.cores.map(cor => (
            <Badge
              key={cor}
              variant="secondary"
              className="bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200 flex items-center gap-1"
              onClick={() => toggleCor(cor)}
            >
              <div
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: cor }}
              />
              <X className="h-3 w-3" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={limparFiltros}
            className="text-gray-500 hover:text-gray-700"
          >
            Limpar tudo
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tagsDisponiveis.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {tagsDisponiveis.map(tag => (
                <Button
                  key={tag}
                  variant={filtros.tags.includes(tag) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTag(tag)}
                  className={filtros.tags.includes(tag) 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        )}

        {coresDisponiveis.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Cores</h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {coresDisponiveis.map(cor => (
                <Button
                  key={cor}
                  variant={filtros.cores.includes(cor) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleCor(cor)}
                  className={`flex items-center gap-2 ${
                    filtros.cores.includes(cor) 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: cor }}
                  />
                  {cor}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}