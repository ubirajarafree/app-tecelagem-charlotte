/*
  # Criação do Schema Completo - Tecelagem Charlotte

  ## 1. Novas Tabelas
  - `usuarios_ext` - Extensão da tabela auth.users com informações adicionais
  - `estampas` - Catálogo de estampas têxteis com imagens, tags e paleta de cores
  - `pedidos` - Cabeçalho dos pedidos dos clientes
  - `itens_pedido` - Itens detalhados de cada pedido
  - `favoritos` - Sistema de favoritos dos usuários
  - `comentarios` - Comentários nas estampas

  ## 2. Segurança
  - Row Level Security (RLS) habilitado em todas as tabelas
  - Políticas de acesso baseadas em autenticação e roles
  - Usuários só acessam seus próprios dados
  - Administradores têm acesso completo

  ## 3. Funcionalidades
  - Sistema completo de gestão de estampas
  - Carrinho e pedidos dos clientes
  - Favoritos e comentários
  - Painel administrativo
*/

-- Extensão para usuários
CREATE TABLE IF NOT EXISTS usuarios_ext (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo text NOT NULL DEFAULT '',
  avatar_url text,
  role text NOT NULL DEFAULT 'cliente' CHECK (role IN ('admin', 'cliente')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Estampas
CREATE TABLE IF NOT EXISTS estampas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo text UNIQUE NOT NULL,
  imagem_url text,
  tags text[] DEFAULT '{}',
  paleta_cores jsonb DEFAULT '{}',
  descricao text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_pedido timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'processando' CHECK (status IN ('processando', 'concluido', 'cancelado')),
  valor_total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Itens do pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  pedido_id uuid NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  estampa_id uuid NOT NULL REFERENCES estampas(id) ON DELETE CASCADE,
  quantidade integer NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  preco_unitario numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Favoritos (tabela de relacionamento)
CREATE TABLE IF NOT EXISTS favoritos (
  usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  estampa_id uuid REFERENCES estampas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (usuario_id, estampa_id)
);

-- Comentários
CREATE TABLE IF NOT EXISTS comentarios (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  estampa_id uuid NOT NULL REFERENCES estampas(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  texto text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_estampas_codigo ON estampas(codigo);
CREATE INDEX IF NOT EXISTS idx_estampas_tags ON estampas USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedido ON itens_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_estampa ON comentarios(estampa_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_usuarios_ext_updated_at') THEN
    CREATE TRIGGER update_usuarios_ext_updated_at
      BEFORE UPDATE ON usuarios_ext
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_estampas_updated_at') THEN
    CREATE TRIGGER update_estampas_updated_at
      BEFORE UPDATE ON estampas
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pedidos_updated_at') THEN
    CREATE TRIGGER update_pedidos_updated_at
      BEFORE UPDATE ON pedidos
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Row Level Security
ALTER TABLE usuarios_ext ENABLE ROW LEVEL SECURITY;
ALTER TABLE estampas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuarios_ext
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON usuarios_ext
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON usuarios_ext
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON usuarios_ext
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Políticas RLS para estampas
CREATE POLICY "Estampas são visíveis para todos os usuários autenticados"
  ON estampas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas administradores podem inserir estampas"
  ON estampas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios_ext 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Apenas administradores podem atualizar estampas"
  ON estampas
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_ext 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Apenas administradores podem deletar estampas"
  ON estampas
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_ext 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para pedidos
CREATE POLICY "Usuários podem ver seus próprios pedidos"
  ON pedidos
  FOR SELECT
  TO authenticated
  USING (
    usuario_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM usuarios_ext 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Usuários podem criar seus próprios pedidos"
  ON pedidos
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Apenas administradores podem atualizar pedidos"
  ON pedidos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_ext 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para itens_pedido
CREATE POLICY "Usuários podem ver itens de seus próprios pedidos"
  ON itens_pedido
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pedidos p
      WHERE p.id = pedido_id AND (
        p.usuario_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM usuarios_ext 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Usuários podem inserir itens em seus próprios pedidos"
  ON itens_pedido
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos p
      WHERE p.id = pedido_id AND p.usuario_id = auth.uid()
    )
  );

-- Políticas RLS para favoritos
CREATE POLICY "Usuários podem gerenciar seus próprios favoritos"
  ON favoritos
  FOR ALL
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- Políticas RLS para comentarios
CREATE POLICY "Comentários são visíveis para todos os usuários autenticados"
  ON comentarios
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir comentários"
  ON comentarios
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seus próprios comentários"
  ON comentarios
  FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem deletar seus próprios comentários"
  ON comentarios
  FOR DELETE
  TO authenticated
  USING (
    usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios_ext 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );