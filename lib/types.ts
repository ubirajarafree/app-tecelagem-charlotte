export interface Usuario {
  id: string
  nome_completo: string
  avatar_url?: string
  role: 'admin' | 'cliente'
}

export interface Estampa {
  id: string
  nome: string
  codigo: string
  imagem_url: string
  tags: string[]
  paleta_cores: { [key: string]: string }
  descricao: string
  created_at: string
  criado_por: string
}

export interface Pedido {
  id: string
  usuario_id: string
  data_pedido: string
  status: 'processando' | 'concluido' | 'cancelado'
  valor_total: number
  itens: ItemPedido[]
}

export interface ItemPedido {
  id: number
  pedido_id: string
  estampa_id: string
  quantidade: number
  preco_unitario: number
  estampa?: Estampa
}

export interface Favorito {
  usuario_id: string
  estampa_id: string
}

export interface Comentario {
  id: number
  estampa_id: string
  usuario_id: string
  texto: string
  created_at: string
  usuario?: Usuario
}

export interface CarrinhoItem {
  estampa: Estampa
  quantidade: number
  preco_unitario: number
}