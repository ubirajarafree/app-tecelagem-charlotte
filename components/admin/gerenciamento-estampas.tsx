'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Usuario, Estampa } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { FormularioEstampa } from './formulario-estampa'
import { Loader2, Search, Plus, Edit, Trash2, Image } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface GerenciamentoEstampasProps {
  usuario: Usuario
}

export function GerenciamentoEstampas({ usuario }: GerenciamentoEstampasProps) {
  const [estampas, setEstampas] = useState<Estampa[]>([])
  const [estampasFiltradas, setEstampasFiltradas] = useState<Estampa[]>([])
  const [estampaEditando, setEstampaEditando] = useState<Estampa | null>(null)
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogAberto, setDialogAberto] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    carregarEstampas()
  }, [])

  useEffect(() => {
    if (busca) {
      const filtradas = estampas.filter(estampa =>
        estampa.nome.toLowerCase().includes(busca.toLowerCase()) ||
        estampa.codigo.toLowerCase().includes(busca.toLowerCase())
      )
      setEstampasFiltradas(filtradas)
    } else {
      setEstampasFiltradas(estampas)
    }
  }, [estampas, busca])

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

  const excluirEstampa = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta estampa?')) return

    try {
      const { error } = await supabase
        .from('estampas')
        .delete()
        .eq('id', id)

      if (error) throw error

      setEstampas(prev => prev.filter(e => e.id !== id))
      toast({
        title: 'Estampa excluída',
        description: 'A estampa foi removida com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleEstampaSalva = (estampa: Estampa) => {
    if (estampaEditando) {
      setEstampas(prev => prev.map(e => e.id === estampa.id ? estampa : e))
    } else {
      setEstampas(prev => [estampa, ...prev])
    }
    setDialogAberto(false)
    setEstampaEditando(null)
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Gerenciamento de Estampas
            </CardTitle>
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setEstampaEditando(null)
                    setDialogAberto(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Estampa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {estampaEditando ? 'Editar Estampa' : 'Nova Estampa'}
                  </DialogTitle>
                </DialogHeader>
                <FormularioEstampa
                  estampa={estampaEditando}
                  usuario={usuario}
                  onSalvar={handleEstampaSalva}
                  onCancelar={() => {
                    setDialogAberto(false)
                    setEstampaEditando(null)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 border-gray-200 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="rounded-md border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-20">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estampasFiltradas.map((estampa) => (
                  <TableRow key={estampa.id} className="bg-white hover:bg-gray-50">
                    <TableCell>
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={estampa.imagem_url || 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg'}
                          alt={estampa.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{estampa.nome}</TableCell>
                    <TableCell className="font-mono text-sm">{estampa.codigo}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {estampa.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {estampa.tags && estampa.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{estampa.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEstampaEditando(estampa)
                            setDialogAberto(true)
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirEstampa(estampa.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {estampasFiltradas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhuma estampa encontrada
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