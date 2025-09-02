-- 1 --

-- Inserir um novo usuário na tabela usuarios_ext usando id (não user_id)
INSERT INTO public.usuarios_ext (id, nome_completo, role)
VALUES (
  'f98aaf1e-7793-46c7-9d02-aea879347d46', -- UUID do usuário 
  'Administrador',
  'admin'
);


-- 2 --

-- Cole isso no SQL Editor do Supabase
SELECT *
FROM auth.users
WHERE id = 'f98aaf1e-7793-46c7-9d02-aea879347d46';


-- 3 --

-- Habilitar RLS na tabela estampas
ALTER TABLE public.estampas ENABLE ROW LEVEL SECURITY;


-- 4 --

-- Este script simula uma chamada de API do seu usuário admin.
-- Defina o contexto da sessão para um usuário autenticado específico.
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "f98aaf1e-7793-46c7-9d02-aea879347d46", "role": "authenticated"}', true);

-- Tente inserir uma linha na tabela 'estampas'.
-- A política de RLS será acionada aqui.
INSERT INTO public.estampas (nome, codigo, criado_por)
VALUES ('Teste de Inserção RLS', 'TESTE-RLS-001', 'f98aaf1e-7793-46c7-9d02-aea879347d46');

-- Verifique se a inserção funcionou.
SELECT * FROM public.estampas WHERE codigo = 'TESTE-RLS-001';

-- Limpe a sessão para voltar ao normal.
RESET ROLE;


-- 5 --

-- Habilitar RLS na tabela storage.objects

-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Permite que usuários autenticados vejam as imagens.
-- Essencial para que o catálogo e os detalhes da estampa funcionem.
CREATE POLICY "Qualquer usuário autenticado pode ver as imagens"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'tecelagem2' );

-- Permite que administradores façam upload de novas imagens.
-- ESTA É A POLÍTICA QUE CORRIGE O ERRO 400 (Bad Request).
CREATE POLICY "Admins podem fazer upload de imagens"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tecelagem2' AND
  EXISTS (
    SELECT 1 FROM public.usuarios_ext
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Permite que administradores atualizem os metadados das imagens.
CREATE POLICY "Admins podem atualizar imagens"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tecelagem2' AND
  EXISTS (
    SELECT 1 FROM public.usuarios_ext
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Permite que administradores deletem imagens.
-- Útil para a melhoria que sugiro abaixo.
CREATE POLICY "Admins podem deletar imagens"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tecelagem2' AND
  EXISTS (
    SELECT 1 FROM public.usuarios_ext
    WHERE id = auth.uid() AND role = 'admin'
  )
);
