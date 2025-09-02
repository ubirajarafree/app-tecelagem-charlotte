# Prompt Abrangente para Geração de Aplicação Web: Tecelagem Charlotte

## 1. Visão Geral

Crie uma aplicação web completa e moderna chamada **"Tecelagem Charlotte"**. O sistema servirá como uma plataforma central para gerenciar um catálogo de estampas têxteis, processar pedidos de clientes e administrar as operações internas da fábrica.

- **Nome da Aplicação:** Tecelagem Charlotte
- **Core Business:** Biblioteca digital de estampas têxteis, com gerenciamento de pedidos e clientes.
- **Público-Alvo:**
  - **Clientes (B2B):** Empresas que compram tecidos e visualizam o catálogo.
  - **Administradores/Equipe Interna:** Gerentes de produção, designers e equipe de vendas que gerenciam o catálogo, os pedidos e os usuários.
- **Estética Visual:** O design deve ser moderno, limpo, responsivo e sofisticado, inspirado na estética do projeto "Monday.com". A paleta de cores deve ser suave, com tons pastel, transmitindo leveza e criatividade. A aplicação deve ter suporte a tema claro (light) somente, descarte o tema descuro (dark).

## 2. Pilha Tecnológica (Tech Stack)

A aplicação deve ser construída utilizando a seguinte pilha de tecnologias:

- **Framework Frontend:** Next.js (com App Router)
- **Linguagem:** TypeScript
- **UI Framework:** React
- **Estilização:** TailwindCSS
- **Componentes UI:** **shadcn/ui**, utilizando componentes como `Input`, `Button`, `Table`, `Dialog`, `Avatar`, etc.
- **Backend e Banco de Dados:** Supabase (utilizando Auth, Database, Storage e Row Level Security).
- **Formulários:** React Hook Form com validação via Zod.

## 3. Estrutura do Banco de Dados (Schema Supabase)

O banco de dados no Supabase deve conter as seguintes tabelas, com segurança de nível de linha (RLS) habilitada para proteger os dados dos usuários.

- **`usuarios_ext`** (para estender a tabela `auth.users`):
  - `id` (UUID, FK para `auth.users.id`)
  - `nome_completo` (text)
  - `avatar_url` (text)
  - `role` (text, ex: 'admin', 'cliente')

- **`estampas`** (catálogo de estampas):
  - `id` (UUID, PK)
  - `nome` (text)
  - `codigo` (text, unique)
  - `imagem_url` (text, link para Supabase Storage)
  - `tags` (text[])
  - `paleta_cores` (jsonb)
  - `descricao` (text)
  - `created_at` (timestampz)
  - `criado_por` (UUID, FK para `auth.users.id`)

- **`pedidos`** (cabeçalho dos pedidos):
  - `id` (UUID, PK)
  - `usuario_id` (UUID, FK para `auth.users.id`)
  - `data_pedido` (timestampz)
  - `status` (text, ex: 'processando', 'concluido', 'cancelado')
  - `valor_total` (numeric)

- **`itens_pedido`** (itens de cada pedido):
  - `id` (bigint, PK)
  - `pedido_id` (UUID, FK para `pedidos.id`)
  - `estampa_id` (UUID, FK para `estampas.id`)
  - `quantidade` (integer)
  - `preco_unitario` (numeric)

- **`favoritos`** (estampas favoritas dos usuários):
  - `usuario_id` (UUID, FK para `auth.users.id`)
  - `estampa_id` (UUID, FK para `estampas.id`)
  - (Chave primária composta por `usuario_id` e `estampa_id`)

- **`comentarios`** (comentários nas estampas):
  - `id` (bigint, PK)
  - `estampa_id` (UUID, FK para `estampas.id`)
  - `usuario_id` (UUID, FK para `auth.users.id`)
  - `texto` (text)
  - `created_at` (timestampz)

## 4. Funcionalidades Principais

### 4.1. Layout Geral e Autenticação
- **Header Fixo:** Logo à esquerda e avatar do usuário à direita com um menu flutuante (Perfil, Logout).
- **Sidebar/Drawer:** Navegação principal com links para "Catálogo", "Favoritos", "Pedidos", "Carrinho" e "Perfil". Um link para "Administração" deve ser visível apenas para usuários com a role 'admin'.
- **Autenticação:** Sistema de login e cadastro de usuários utilizando Supabase Auth.

### 4.2. Módulos do Cliente
- **Catálogo de Estampas:**
  - Grid de cards responsivo mostrando imagem, nome e código da estampa.
  - Filtros por palavra-chave, código, cor e tags.
  - Funcionalidade para favoritar uma estampa.
  - Página de detalhe da estampa com imagem ampliada, informações completas e seção de comentários.
- **Carrinho e Pedidos:**
  - Funcionalidade para adicionar estampas a um carrinho.
  - Página de carrinho para revisar os itens e finalizar o pedido.
  - Página de "Histórico de Pedidos" que lista todos os pedidos do usuário logado, com status e valor. Ao clicar em um pedido, exibe-se uma tela de detalhes com os itens, preços e informações de entrega.

### 4.3. Módulo de Administração (Acesso Restrito)
- **Dashboard de Gerenciamento de Estampas:**
  - Uma tabela (`shadcn/ui Table`) listando todas as estampas cadastradas.
  - Colunas: Imagem (thumbnail), Nome, Código, Tags, Ações (Editar, Excluir).
  - Funcionalidade de busca e paginação na tabela.
- **Cadastro e Edição de Estampas:**
  - Um formulário (dentro de um `Dialog` ou em uma página dedicada `/upload`) para adicionar novas estampas.
  - Campos: Upload de imagem (para Supabase Storage), Nome, Código, Paleta de Cores, Tags (com sugestões).
  - Feedback visual (toasts/alertas) para sucesso ou erro nas operações.
- **Gerenciamento de Pedidos:**
  - Uma visão geral de todos os pedidos de todos os clientes.
  - Capacidade de filtrar pedidos por status, cliente ou data.
  - Ação para atualizar o status de um pedido (ex: de 'processando' para 'concluido').

## 5. Requisitos de UI/UX e Acessibilidade
- **Responsividade:** O layout deve ser mobile-first e se adaptar perfeitamente a tablets e desktops.
- **Componentes:** Utilizar `shadcn/ui` para garantir consistência visual e funcional.
- **Feedback ao Usuário:** Implementar estados de carregamento (loading states), mensagens de sucesso e erro claras para todas as ações assíncronas.
- **Acessibilidade:** Garantir que a aplicação seja navegável via teclado, que os contrastes de cores sejam adequados e que as imagens tenham textos alternativos.
- **Acessibilidade:** Considere o uso de `infinite Loader` para a navegação da galeria principal do catálogo, com link para detalhes e garantindo que no retorno da página de detalhes seja a galeria na mesma posição do scroll, desta forma, mantendo o que foi carregado anteriormente. 

## 6. Sugestão de Stack
- **Stack de Preferência:** Considere a stack Node.js, Next.js Latest, Shadcn Latest e Tailwind Latest. Considere o Supabase e sua API para o Back-End. Considere o uso de variáveis de ambiente em arquivo `.env`. 

Este prompt consolida a visão do projeto, detalhando a estrutura de dados, as funcionalidades por perfil de usuário e os requisitos técnicos e de design.
