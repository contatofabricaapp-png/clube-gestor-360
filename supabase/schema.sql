-- ============================================================
-- Clube Gestor 360 — Schema Supabase
-- Execute este arquivo no SQL Editor do seu projeto Supabase
-- ============================================================

-- ── Extensões ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tabela: config ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS config (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_clube             TEXT NOT NULL DEFAULT 'Clube Esportivo',
  pix_chave              TEXT,
  pix_tipo               TEXT DEFAULT 'Email',
  punicao_noshow_limite  INTEGER NOT NULL DEFAULT 3,
  punicao_dias_bloqueio  INTEGER NOT NULL DEFAULT 7,
  checkin_geolocalizacao BOOLEAN NOT NULL DEFAULT true,
  raio_checkin_metros    INTEGER NOT NULL DEFAULT 50,
  clube_lat              DOUBLE PRECISION,
  clube_lng              DOUBLE PRECISION,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos autenticados podem ler config"
  ON config FOR SELECT TO authenticated USING (true);

CREATE POLICY "Apenas admin pode alterar config"
  ON config FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'perfil') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'perfil') = 'admin');

-- ── Tabela: modulos ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modulos (
  id                   INTEGER PRIMARY KEY,
  nome                 TEXT NOT NULL,
  icone                TEXT,
  ativo                BOOLEAN NOT NULL DEFAULT true,
  gratuito             BOOLEAN NOT NULL DEFAULT true,
  valor                NUMERIC(10,2) NOT NULL DEFAULT 0,
  duracao              TEXT NOT NULL DEFAULT '60',  -- número em minutos ou 'Diária'
  antecedencia_maxima  INTEGER NOT NULL DEFAULT 48,
  janela_cancelamento  INTEGER NOT NULL DEFAULT 2,
  fila_habilitada      BOOLEAN NOT NULL DEFAULT false,
  tipo_fila            TEXT NOT NULL DEFAULT 'checkin',
  antecedencia_fila    INTEGER NOT NULL DEFAULT 30,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos autenticados podem ler modulos"
  ON modulos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Apenas admin pode alterar modulos"
  ON modulos FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'perfil') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'perfil') = 'admin');

-- ── Tabela: recursos ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recursos (
  id          INTEGER PRIMARY KEY,
  modulo_id   INTEGER NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  capacidade  INTEGER NOT NULL DEFAULT 4,
  status      TEXT NOT NULL DEFAULT 'Livre',
  motivo      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos autenticados podem ler recursos"
  ON recursos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Funcionario e admin podem alterar recursos"
  ON recursos FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'perfil') IN ('funcionario', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'perfil') IN ('funcionario', 'admin'));

-- ── Tabela: aulas ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aulas (
  id          INTEGER PRIMARY KEY,
  recurso_id  INTEGER NOT NULL REFERENCES recursos(id) ON DELETE CASCADE,
  dias_semana INTEGER[] NOT NULL DEFAULT '{}',
  hora_inicio TEXT NOT NULL,
  hora_fim    TEXT NOT NULL,
  professor   TEXT,
  nome        TEXT,
  status      TEXT NOT NULL DEFAULT 'ativo',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos autenticados podem ler aulas"
  ON aulas FOR SELECT TO authenticated USING (true);

CREATE POLICY "Apenas admin pode alterar aulas"
  ON aulas FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'perfil') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'perfil') = 'admin');

-- ── Tabela: usuarios ─────────────────────────────────────────
-- Vinculada ao Supabase Auth pelo auth_id (= auth.users.id)
CREATE TABLE IF NOT EXISTS usuarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  nome          TEXT NOT NULL,
  matricula     TEXT NOT NULL UNIQUE,
  perfil        TEXT NOT NULL DEFAULT 'socio',  -- admin | funcionario | socio
  status        TEXT NOT NULL DEFAULT 'Ativo',  -- Ativo | Bloqueado | Cancelado
  noshow_count  INTEGER NOT NULL DEFAULT 0,
  bloqueado_ate DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario pode ler seu proprio perfil"
  ON usuarios FOR SELECT TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Admin e funcionario podem ler todos usuarios"
  ON usuarios FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'perfil') IN ('admin', 'funcionario'));

CREATE POLICY "Apenas admin pode alterar usuarios"
  ON usuarios FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'perfil') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'perfil') = 'admin');

-- ── Tabela: reservas ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservas (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id       UUID NOT NULL REFERENCES usuarios(id),
  recurso_id       INTEGER NOT NULL REFERENCES recursos(id),
  modulo_id        INTEGER NOT NULL REFERENCES modulos(id),
  data_reserva     DATE NOT NULL,
  hora_inicio      TEXT NOT NULL,
  hora_fim         TEXT NOT NULL,
  tipo             TEXT NOT NULL DEFAULT 'agendamento',  -- agendamento | checkin
  status           TEXT NOT NULL DEFAULT 'Pendente',
    -- Pendente | Em Andamento | Finalizada | Cancelada | No-Show | Confirmada
  pix_comprovante  TEXT,  -- path no Storage ou null
  iniciada_em      TIMESTAMPTZ,
  encerrada_em     TIMESTAMPTZ,
  duracao_segundos INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Socio ve suas proprias reservas"
  ON reservas FOR SELECT TO authenticated
  USING (usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

CREATE POLICY "Funcionario e admin veem todas as reservas"
  ON reservas FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'perfil') IN ('funcionario', 'admin'));

CREATE POLICY "Socio pode criar propria reserva"
  ON reservas FOR INSERT TO authenticated
  WITH CHECK (usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

CREATE POLICY "Funcionario e admin podem alterar reservas"
  ON reservas FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'perfil') IN ('funcionario', 'admin'));

-- ── Tabela: fila ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fila (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   UUID NOT NULL REFERENCES usuarios(id),
  modulo_id    INTEGER NOT NULL REFERENCES modulos(id),
  recurso_id   INTEGER REFERENCES recursos(id),
  data         DATE NOT NULL,
  posicao      INTEGER,
  status       TEXT NOT NULL DEFAULT 'Aguardando',
    -- Aguardando | Chamado | Confirmado | Cancelado
  chamado_em   TIMESTAMPTZ,
  checkin_lat  DOUBLE PRECISION,
  checkin_lng  DOUBLE PRECISION,
  entrada_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE fila ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Socio ve sua propria posicao na fila"
  ON fila FOR SELECT TO authenticated
  USING (usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

CREATE POLICY "Funcionario e admin veem toda a fila"
  ON fila FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'perfil') IN ('funcionario', 'admin'));

CREATE POLICY "Socio pode entrar na fila"
  ON fila FOR INSERT TO authenticated
  WITH CHECK (usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

CREATE POLICY "Funcionario e admin podem alterar fila"
  ON fila FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'perfil') IN ('funcionario', 'admin'));

-- ── Realtime ─────────────────────────────────────────────────
-- Habilitar realtime nas tabelas que a Lousa e o Admin consomem (T24)
ALTER PUBLICATION supabase_realtime ADD TABLE recursos;
ALTER PUBLICATION supabase_realtime ADD TABLE reservas;
ALTER PUBLICATION supabase_realtime ADD TABLE fila;

-- ============================================================
-- SEEDS — dados iniciais
-- ============================================================

-- Config do clube
INSERT INTO config (nome_clube, pix_chave, pix_tipo, punicao_noshow_limite, punicao_dias_bloqueio, checkin_geolocalizacao, raio_checkin_metros, clube_lat, clube_lng)
VALUES ('Clube Esportivo Horizonte', 'contato@clubehorizonte.com.br', 'Email', 3, 7, true, 50, null, null);

-- Módulos
INSERT INTO modulos (id, nome, icone, ativo, gratuito, valor, duracao, antecedencia_maxima, janela_cancelamento, fila_habilitada, tipo_fila, antecedencia_fila) VALUES
  (1, 'Tênis',           '🎾', true,  true,  0,   '60',    48,  2,  true,  'checkin',     30),
  (6, 'Beach Tennis',    '🏖️', true,  true,  0,   '60',    48,  2,  true,  'checkin',     30),
  (2, 'Futebol',         '⚽', true,  true,  0,   '90',    72,  4,  true,  'agendamento', 60),
  (3, 'Quiosque',        '🏠', true,  false, 350, 'Diária',720, 48, false, 'checkin',     0),
  (4, 'Salão de Festas', '🎉', true,  false, 800, 'Diária',720, 72, false, 'checkin',     0),
  (5, 'Piscina',         '🏊', false, true,  0,   '120',   24,  1,  false, 'checkin',     15);

-- Recursos
INSERT INTO recursos (id, modulo_id, nome, capacidade, status, motivo) VALUES
  (1,  1, 'Quadra de Tênis 01', 4,   'Livre',       null),
  (2,  1, 'Quadra de Tênis 02', 4,   'Livre',       null),
  (3,  1, 'Quadra de Tênis 03', 4,   'Manutencao',  'Troca de rede prevista para sexta'),
  (4,  1, 'Quadra de Tênis 04', 4,   'Livre',       null),
  (5,  1, 'Quadra de Tênis 05', 4,   'Livre',       null),
  (6,  1, 'Quadra de Tênis 06', 4,   'Livre',       null),
  (7,  1, 'Quadra de Tênis 07', 4,   'Livre',       null),
  (8,  1, 'Quadra de Tênis 08', 4,   'Livre',       null),
  (9,  1, 'Quadra de Tênis 09', 4,   'Livre',       null),
  (10, 1, 'Quadra de Tênis 10', 4,   'Livre',       null),
  (11, 6, 'Quadra Beach 01',    4,   'Livre',       null),
  (12, 6, 'Quadra Beach 02',    4,   'Livre',       null),
  (13, 6, 'Quadra Beach 03',    4,   'Livre',       null),
  (14, 6, 'Quadra Beach 04',    4,   'Livre',       null),
  (15, 2, 'Campo Society 01',   14,  'Livre',       null),
  (16, 2, 'Campo Society 02',   14,  'Interditada', 'Gramado molhado - chuva forte'),
  (17, 3, 'Quiosque 01',        30,  'Livre',       null),
  (18, 3, 'Quiosque 02',        25,  'Livre',       null),
  (19, 4, 'Salão Principal',    150, 'Livre',       null);

-- Aulas
INSERT INTO aulas (id, recurso_id, dias_semana, hora_inicio, hora_fim, professor, nome, status) VALUES
  (1, 1,  '{1,3}', '18:00', '20:00', 'Daniel', 'Treino Performance', 'ativo'),
  (2, 2,  '{2,4}', '09:00', '11:00', 'Moacyr', 'Aula Iniciante',     'ativo'),
  (3, 11, '{5}',   '17:00', '19:00', 'Xitão',  'Beach Pro',          'ativo');
