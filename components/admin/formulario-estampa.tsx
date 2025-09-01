'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase'
import { Usuario, Estampa } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { X, Plus, Loader2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const estampaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  codigo: z.string().min(1, 'Código é obrigatório'),
  descricao: z.string().optional(),
})

interface FormularioEstampaProps {
  estampa?: Estampa | null
  usuario: Usuario
  onSalvar: (estampa: Estampa) => void
  onCancelar: () => void
}

export function FormularioEstampa({ estampa, usuario, onSalvar, onCancelar }: FormularioEstampaProps) {
  const [tags, setTags] = useState<string[]>(estampa?.tags || [])
  const [novaTag, setNovaTag] = useState('')
  const [cores, setCores] = useState(estampa?.paleta_cores || {})
  const [novaCor, setNovaCor] = useState({ nome: '', valor: '#000000' })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof estampaSchema>>({
    resolver: zodResolver(estampaSchema),
    defaultValues: {
      nome: estampa?.nome || '',
      codigo: estampa?.codigo || '',
      descricao: estampa?.descricao || '',
    },
  })

  const adicionarTag = () => {
    if (novaTag && !tags.includes(novaTag)) {
      setTags([...tags, novaTag])
      setNovaTag('')
    }
  }

  const removerTag = (tagRemover: string) => {
    setTags(tags.filter(tag => tag !== tagRemover))
  }

  const adicionarCor = () => {
    if (novaCor.nome && novaCor.valor) {
      setCores({ ...cores, [novaCor.nome]: novaCor.valor })
      setNovaCor({ nome: '', valor: '#000000' })
    }
  }

  const removerCor = (nomeRemover: string) => {
    const novasCores = { ...cores }
    delete novasCores[nomeRemover]
    setCores(novasCores)
  }

  const onSubmit = async (values: z.infer<typeof estampaSchema>) => {
    setLoading(true)

    try {
      const dadosEstampa = {
        ...values,
        tags,
        paleta_cores: cores,
        imagem_url: estampa?.imagem_url || 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg',
        criado_por: usuario.id,
      }

      if (estampa) {
        const { data, error } = await supabase
          .from('estampas')
          .update(dadosEstampa)
          .eq('id', estampa.id)
          .select()
          .single()

        if (error) throw error
        onSalvar(data)
        toast({
          title: 'Estampa atualizada',
          description: 'As alterações foram salvas com sucesso.',
        })
      } else {
        const { data, error } = await supabase
          .from('estampas')
          .insert([dadosEstampa])
          .select()
          .single()

        if (error) throw error
        onSalvar(data)
        toast({
          title: 'Estampa criada',
          description: 'A nova estampa foi adicionada ao catálogo.',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Estampa</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Floral Tropical" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: FT001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva a estampa, suas características e aplicações..."
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="space-y-2 mt-2">
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar tag"
                value={novaTag}
                onChange={(e) => setNovaTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarTag())}
              />
              <Button type="button" onClick={adicionarTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removerTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Paleta de cores */}
        <div>
          <Label>Paleta de Cores</Label>
          <div className="space-y-2 mt-2">
            <div className="flex gap-2">
              <Input
                placeholder="Nome da cor"
                value={novaCor.nome}
                onChange={(e) => setNovaCor({ ...novaCor, nome: e.target.value })}
              />
              <Input
                type="color"
                value={novaCor.valor}
                onChange={(e) => setNovaCor({ ...novaCor, valor: e.target.value })}
                className="w-20"
              />
              <Button type="button" onClick={adicionarCor} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {Object.keys(cores).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(cores).map(([nome, valor]) => (
                  <div key={nome} className="flex items-center gap-2 p-2 border rounded-lg">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: valor }}
                    />
                    <span className="text-sm flex-1 capitalize">{nome}</span>
                    <button
                      type="button"
                      onClick={() => removerCor(nome)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {estampa ? 'Atualizar' : 'Criar'} Estampa
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  )
}