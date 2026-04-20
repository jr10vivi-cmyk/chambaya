-- =============================================================
-- ChambaYA -- Disputas + NPS + Referidos + Origen de Registro
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- =============================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. SISTEMA DE DISPUTAS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS disputas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id    uuid REFERENCES solicitudes(id) ON DELETE CASCADE,
  cliente_id      uuid REFERENCES profiles(id),
  tecnico_id      uuid REFERENCES profiles(id),
  motivo          text NOT NULL,
  descripcion     text,
  estado          text NOT NULL DEFAULT 'abierta'
                  CHECK (estado IN ('abierta','en_revision','resuelta_cliente','resuelta_tecnico','cerrada')),
  resolucion      text,                  -- nota del admin al resolver
  admin_id        uuid REFERENCES profiles(id),
  creado_en       timestamptz DEFAULT now(),
  resuelto_en     timestamptz
);

ALTER TABLE disputas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS disputas_select ON disputas;
CREATE POLICY disputas_select ON disputas FOR SELECT
  USING (
    auth.uid() = cliente_id OR
    auth.uid() = tecnico_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS disputas_insert_cliente ON disputas;
CREATE POLICY disputas_insert_cliente ON disputas FOR INSERT
  WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS disputas_update_admin ON disputas;
CREATE POLICY disputas_update_admin ON disputas FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Columna estado en solicitudes para disputa activa
ALTER TABLE solicitudes
  ADD COLUMN IF NOT EXISTS tiene_disputa boolean DEFAULT false;

-- Función: abrir_disputa
CREATE OR REPLACE FUNCTION abrir_disputa(
  p_solicitud_id  uuid,
  p_motivo        text,
  p_descripcion   text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_disputa_id uuid;
  v_sol solicitudes%ROWTYPE;
BEGIN
  SELECT * INTO v_sol FROM solicitudes WHERE id = p_solicitud_id;
  IF v_sol.id IS NULL THEN RAISE EXCEPTION 'Solicitud no encontrada'; END IF;

  INSERT INTO disputas (solicitud_id, cliente_id, tecnico_id, motivo, descripcion)
  VALUES (p_solicitud_id, v_sol.cliente_id, v_sol.tecnico_id, p_motivo, p_descripcion)
  RETURNING id INTO v_disputa_id;

  UPDATE solicitudes SET tiene_disputa = true WHERE id = p_solicitud_id;

  -- Notificar al admin
  INSERT INTO notificaciones (usuario_id, tipo, titulo, datos)
  SELECT id, 'disputa_abierta', 'Nueva disputa abierta — requiere revisión',
    jsonb_build_object('disputa_id', v_disputa_id, 'solicitud_id', p_solicitud_id)
  FROM profiles WHERE role = 'admin' LIMIT 1;

  RETURN v_disputa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: resolver_disputa (admin)
CREATE OR REPLACE FUNCTION resolver_disputa(
  p_disputa_id    uuid,
  p_decision      text,   -- 'resuelta_cliente' | 'resuelta_tecnico' | 'cerrada'
  p_resolucion    text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_d disputas%ROWTYPE;
BEGIN
  SELECT * INTO v_d FROM disputas WHERE id = p_disputa_id;

  UPDATE disputas SET
    estado      = p_decision,
    resolucion  = p_resolucion,
    admin_id    = auth.uid(),
    resuelto_en = now()
  WHERE id = p_disputa_id;

  UPDATE solicitudes SET tiene_disputa = false WHERE id = v_d.solicitud_id;

  -- Si se resuelve a favor del cliente → marcar pago como reembolsado
  IF p_decision = 'resuelta_cliente' THEN
    UPDATE pagos SET estado = 'reembolsado'
    WHERE solicitud_id = v_d.solicitud_id AND estado = 'completado';
  END IF;

  -- Notificar a ambas partes
  INSERT INTO notificaciones (usuario_id, tipo, titulo, datos)
  VALUES
    (v_d.cliente_id, 'disputa_resuelta', 'Tu disputa fue resuelta.',
     jsonb_build_object('decision', p_decision, 'resolucion', p_resolucion)),
    (v_d.tecnico_id, 'disputa_resuelta', 'Una disputa fue resuelta.',
     jsonb_build_object('decision', p_decision, 'resolucion', p_resolucion));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- 2. NPS (Net Promoter Score) POST-SERVICIO
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS nps_respuestas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      uuid REFERENCES profiles(id) ON DELETE CASCADE,
  solicitud_id    uuid REFERENCES solicitudes(id) ON DELETE CASCADE,
  puntuacion      integer NOT NULL CHECK (puntuacion >= 0 AND puntuacion <= 10),
  comentario      text,
  creado_en       timestamptz DEFAULT now(),
  UNIQUE (usuario_id, solicitud_id)
);

ALTER TABLE nps_respuestas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS nps_insert ON nps_respuestas;
CREATE POLICY nps_insert ON nps_respuestas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS nps_select_admin ON nps_respuestas;
CREATE POLICY nps_select_admin ON nps_respuestas FOR SELECT
  USING (
    auth.uid() = usuario_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════
-- 3. REFERIDOS
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS origen_registro   text DEFAULT 'directo'
    CHECK (origen_registro IN ('directo','referido','municipalidad','redes_sociales','otro')),
  ADD COLUMN IF NOT EXISTS codigo_referido   text UNIQUE,
  ADD COLUMN IF NOT EXISTS referido_por      uuid REFERENCES profiles(id);

-- Generar código de referido automáticamente al crear perfil
CREATE OR REPLACE FUNCTION generar_codigo_referido()
RETURNS TRIGGER AS $$
BEGIN
  NEW.codigo_referido := UPPER(SUBSTRING(MD5(NEW.id::text || now()::text), 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generar_codigo ON profiles;
CREATE TRIGGER tr_generar_codigo
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION generar_codigo_referido();
