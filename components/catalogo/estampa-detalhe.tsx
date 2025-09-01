'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Usuario, Estampa, Comentario } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Heart, ShoppingCart, MessageCircle, Send, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface EstampaDetalheProps {
  estampa: Estampa
  usuario: Usuario
  onVoltar: () => void
}

export function EstampaDetalhe({ estampa, usuario, onVoltar }: EstampaDetalheProps) {
  const [favorita, setFavorita] = useState(false)
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [novoComentario, setNovoComentario] = useState('')
  const [loadingFavorito, setLoadingFavorito] = useState(false)
  const [loadingComentario, setLoadingComentario] = useState(false)
  const [loadingComentarios, setLoadingComentarios] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    verificarFavorito()
    carregarComentarios()
  }, [])

  const verificarFavorito = async () => {
    try {
      const { data } = await supabase
        .from('favoritos')
        .select('*')
        .eq('usuario_id', usuario.id)
        .eq('estampa_id', estampa.id)
        .single()

      setFavorita(!!data)
    } catch (error) {
      // Não é favorito
    }
  }

  const carregarComentarios = async () => {
    try {
      const { data, error } = await supabase
        .from('comentarios')
        .select(`
          *,
          usuario:usuarios_ext(nome_completo, avatar_url)
        `)
        .eq('estampa_id', estampa.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComentarios(data || [])
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar comentários',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoadingComentarios(false)
    }
  }

  const toggleFavorito = async () => {
    setLoadingFavorito(true)

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

  const adicionarComentario = async () => {
    if (!novoComentario.trim()) return

    setLoadingComentario(true)

    try {
      const { data, error } = await supabase
        .from('comentarios')
        .insert([{
          estampa_id: estampa.id,
          usuario_id: usuario.id,
          texto: novoComentario.trim()
        }])
        .select(`
          *,
          usuario:usuarios_ext(nome_completo, avatar_url)
        `)
        .single()

      if (error) throw error

      setComentarios(prev => [data, ...prev])
      setNovoComentario('')
      
      toast({
        title: 'Comentário adicionado',
        description: 'Seu comentário foi publicado com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar comentário',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoadingComentario(false)
    }
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onVoltar}
        className="mb-4 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar ao catálogo
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagem da estampa */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-sm border border-purple-100">
            <img
              src={estampa.imagem_url || 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg'}
              alt={estampa.nome}
              className="w-full h-full object-cover"
            />
          </div>
          
          {estampa.paleta_cores && Object.keys(estampa.paleta_cores).length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="text-sm">Paleta de Cores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(estampa.paleta_cores).map(([nome, cor]) => (
                    <div key={nome} className="text-center">
                      <div
                        className="w-full h-12 rounded-lg border border-gray-200 shadow-sm mb-2"
                        style={{ backgroundColor: cor }}
                      />
                      <span className="text-xs text-gray-600 capitalize">{nome}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Informações da estampa */}
        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{estampa.nome}</h1>
                <p className="text-lg text-gray-600 font-mono">{estampa.codigo}</p>
              </div>

              {estampa.descricao && (
                <p className="text-gray-700 leading-relaxed">{estampa.descricao}</p>
              )}

              {estampa.tags && estampa.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {estampa.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-purple-50 text-purple-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={toggleFavorito}
                  disabled={loadingFavorito}
                  variant={favorita ? 'default' : 'outline'}
                  className={cn(
                    'flex-1',
                    favorita && 'bg-red-500 hover:bg-red-600 text-white'
                  )}
                >
                  {loadingFavorito ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Heart className={cn('h-4 w-4 mr-2', favorita && 'fill-current')} />
                  )}
                  {favorita ? 'Favorito' : 'Favoritar'}
                </Button>
                
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Adicionar ao carrinho
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comentários */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comentários ({comentarios.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Adicionar comentário */}
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={usuario.avatar_url || ''} />
                  <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                    {usuario.nome_completo.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Adicione um comentário..."
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    className="resize-none border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                    rows={2}
                  />
                  <Button
                    size="sm"
                    onClick={adicionarComentario}
                    disabled={!novoComentario.trim() || loadingComentario}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loadingComentario ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Comentar
                  </Button>
                </div>
              </div>

              {/* Lista de comentários */}
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {loadingComentarios ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  </div>
                ) : comentarios.length > 0 ? (
                  comentarios.map((comentario) => (
                    <div key={comentario.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comentario.usuario?.avatar_url || ''} />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                          {comentario.usuario?.nome_completo.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-800">
                            {comentario.usuario?.nome_completo}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comentario.created_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comentario.texto}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Seja o primeiro a comentar sobre esta estampa!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}