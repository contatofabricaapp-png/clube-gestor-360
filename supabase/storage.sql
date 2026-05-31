-- ============================================================
-- Clube Gestor 360 — Supabase Storage
-- Execute após o schema.sql
-- ============================================================

-- Bucket para comprovantes de pagamento PIX (privado)
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes-pix', 'comprovantes-pix', false)
ON CONFLICT (id) DO NOTHING;

-- Socio pode fazer upload do próprio comprovante
CREATE POLICY "Socio pode fazer upload de comprovante"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'comprovantes-pix' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Socio pode ler seus próprios comprovantes
CREATE POLICY "Socio pode ler seus comprovantes"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'comprovantes-pix' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin e funcionario podem ler todos os comprovantes
CREATE POLICY "Admin e funcionario leem todos comprovantes"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'comprovantes-pix' AND
    (auth.jwt() ->> 'perfil') IN ('admin', 'funcionario')
  );
