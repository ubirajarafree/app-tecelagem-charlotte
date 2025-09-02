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
import { X, Plus, Loader2, Save, Upload } from 'lucide-react'
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
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(estampa?.imagem_url || null)
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

  const handleSelecaoImagem = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setArquivoImagem(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (values: z.infer<typeof estampaSchema>) => {
    setLoading(true)
    let imageUrl = estampa?.imagem_url || ''
    const oldImageUrl = estampa?.imagem_url // Guarda a URL antiga para possível exclusão

    try {
      // 1. Faz o upload da nova imagem, se uma foi selecionada
      if (arquivoImagem) {
        // Extrai a extensão do arquivo original (ex: .jpg, .png)
        const extensao = arquivoImagem.name.split('.').pop()
        // Cria um nome de arquivo único com a extensão correta
        const nomeArquivo = `${usuario.id}-${Date.now()}.${extensao}`
        const { error: uploadError } = await supabase.storage
          .from('tecelagem2') // <-- Nome do seu bucket
          .upload(nomeArquivo, arquivoImagem)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('tecelagem2')
          .getPublicUrl(nomeArquivo)
        
        imageUrl = urlData.publicUrl
      } else if (!estampa) {
        // 2. Garante que uma imagem seja enviada ao criar uma nova estampa
        toast({
          title: 'Imagem obrigatória',
          description: 'Por favor, selecione uma imagem para a nova estampa.',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      // 3. Prepara os dados para salvar no banco
      const dadosEstampa = {
        ...values,
        tags,
        paleta_cores: cores,
        imagem_url: imageUrl,
        criado_por: estampa ? undefined : usuario.id, // Define 'criado_por' apenas na criação
      }

      if (estampa) {
        const { data, error } = await supabase
          .from('estampas')
          .update({ ...dadosEstampa, criado_por: undefined }) // Não atualiza 'criado_por'
          .eq('id', estampa.id)
          .select()
          .single()

        if (error) throw error

        // 4. Se a atualização do banco foi bem-sucedida e uma nova imagem foi enviada,
        //    deleta a imagem antiga do Storage para não deixar arquivos órfãos.
        if (arquivoImagem && oldImageUrl) {
          const nomeArquivoAntigo = oldImageUrl.split('/').pop()
          if (nomeArquivoAntigo) {
            // Executa a remoção em segundo plano. Se falhar, não impede o fluxo,
            // apenas registra o erro no console.
            supabase.storage.from('tecelagem2').remove([nomeArquivoAntigo]).then(({ error: removeError }) => {
              if (removeError) {
                console.error('Falha ao deletar imagem antiga do Storage:', removeError.message)
              }
            })
          }
        }

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

        // --- PASSO DE DEPURAÇÃO ---
        // Loga a resposta exata do Supabase no console do navegador
        console.log('Resultado da inserção no Supabase:', { data, error })

        if (error) throw error

        // --- VERIFICAÇÃO CRUCIAL ---
        // Se o erro for nulo mas nenhum dado for retornado, a RLS provavelmente bloqueou a ação.
        // Isso tornará o erro "silencioso" em um erro "visível".
        if (!data) {
          throw new Error('A inserção falhou silenciosamente. Verifique as permissões (RLS) e os logs da API no painel do Supabase.')
        }

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
        {/* Campo de Upload de Imagem */}
        <FormItem>
          <FormLabel>Imagem da Estampa</FormLabel>
          <FormControl>
            <div className="flex items-center gap-4">
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
              )}
              <Label htmlFor="picture" className="flex-1 flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                  <p className="text-xs text-gray-500">PNG, JPG ou WEBP</p>
                </div>
                <Input 
                  id="picture" 
                  type="file" 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleSelecaoImagem}
                />
              </Label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>


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