'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { User, Save, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function PerfilPagina() {
  const { usuario, updateUsuario } = useAuth()
  const [nomeCompleto, setNomeCompleto] = useState(usuario?.nome_completo || '')
  const [loading, setSalvando] = useState(false)
  const { toast } = useToast()

  if (!usuario) return null

  const salvarPerfil = async () => {
    setSalvando(true)

    try {
      const { data, error } = await supabase
        .from('usuarios_ext')
        .update({ nome_completo: nomeCompleto })
        .eq('id', usuario.id)
        .select()
        .single()

      if (error) throw error

      updateUsuario(data)
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  const iniciais = usuario.nome_completo
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-purple-100">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar */}
        <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24 ring-4 ring-purple-100">
              <AvatarImage src={usuario.avatar_url || ''} alt={usuario.nome_completo} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg">
                {iniciais}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" disabled className="border-gray-200 text-gray-500">
              Alterar foto
            </Button>
            <p className="text-xs text-gray-500 text-center">
              JPG, GIF ou PNG. Máximo 1MB.
            </p>
          </CardContent>
        </Card>

        {/* Informações */}
        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  placeholder="Seu nome completo"
                  className="border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Input
                  id="role"
                  value={usuario.role === 'admin' ? 'Administrador' : 'Cliente'}
                  disabled
                  className="border-gray-200 bg-gray-50 text-gray-600"
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={salvarPerfil}
                  disabled={loading || !nomeCompleto || nomeCompleto === usuario.nome_completo}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}