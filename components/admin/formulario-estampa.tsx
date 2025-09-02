'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Estampa } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormImageUpload } from './form-image-upload'
import { FormTagsInput } from './form-tags-input'
import { FormColorPaletteInput } from './form-color-palette-input'
import { useTags } from '@/hooks/use-tags'
import { useColorPalette } from '@/hooks/use-color-palette'
import { useImageUpload } from '@/hooks/use-image-upload'
import { Loader2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const estampaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  codigo: z.string().min(1, 'Código é obrigatório'),
  descricao: z.string().optional(),
})

interface FormularioEstampaProps {
  estampa?: Estampa | null
  onSalvar: (estampa: Estampa) => void
  onCancelar: () => void
}

export function FormularioEstampa({ estampa, onSalvar, onCancelar }: FormularioEstampaProps) {
  const { usuario } = useAuth()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { tags, novaTag, setNovaTag, adicionarTag, removerTag } = useTags(estampa?.tags)
  const { cores, novaCor, setNovaCor, adicionarCor, removerCor } = useColorPalette(estampa?.paleta_cores)
  const { arquivoImagem, previewUrl, handleSelecaoImagem } = useImageUpload(estampa?.imagem_url)

  const form = useForm<z.infer<typeof estampaSchema>>({
    resolver: zodResolver(estampaSchema),
    defaultValues: {
      nome: estampa?.nome || '',
      codigo: estampa?.codigo || '',
      descricao: estampa?.descricao || '',
    },
  })

  if (!usuario) return null

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

        // --- VERIFICAÇÃO CRUCIAL ---
        if (!data) {
          throw new Error('A atualização falhou silenciosamente. Verifique as permissões (RLS) e os logs da API no painel do Supabase.')
        }

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
        <FormImageUpload
          previewUrl={previewUrl}
          handleSelecaoImagem={handleSelecaoImagem}
        />

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

        <FormTagsInput
          tags={tags}
          novaTag={novaTag}
          setNovaTag={setNovaTag}
          adicionarTag={adicionarTag}
          removerTag={removerTag}
        />

        <FormColorPaletteInput
          cores={cores}
          novaCor={novaCor}
          setNovaCor={setNovaCor}
          adicionarCor={adicionarCor}
          removerCor={removerCor}
        />

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