/**
 * Este arquivo define os tipos de dados customizados para a aplicação.
 * Eles são baseados no schema do banco de dados, mas incluem propriedades
 * opcionais para acomodar os dados retornados por queries com joins.
 */

export interface Usuario {
  id: string
  nome_completo: string
  avatar_url: string | null
  role: 'admin' | 'cliente'
  created_at: string
  updated_at: string
}

export interface Estampa {
  id: string
  nome: string
  codigo: string
  imagem_url: string | null
  tags: string[]
  paleta_cores: { [key: string]: string }
  descricao: string
  created_at: string
  updated_at: string
  criado_por: string | null
}

export interface ItemPedido {
  id: number
  pedido_id: string
  estampa_id: string
  quantidade: number
  preco_unitario: number
  created_at: string
  // Propriedade opcional do join
  estampa?: Estampa | null
}

export interface Pedido {
  id: string
  usuario_id: string
  data_pedido: string
  status: 'processando' | 'concluido' | 'cancelado'
  valor_total: number
  created_at: string
  updated_at: string
  // Propriedades opcionais dos joins
  usuario?: Pick<Usuario, 'nome_completo'> | null
  itens?: ItemPedido[] | null
}

export interface Comentario {
  id: number
  estampa_id: string
  usuario_id: string
  texto: string
  created_at: string
  // Propriedade opcional do join
  usuario?: Pick<Usuario, 'nome_completo' | 'avatar_url'> | null
}