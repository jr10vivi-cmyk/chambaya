-- =============================================================
-- ChambaYA -- Modulo de Suscripciones Premium
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- =============================================================

-- 1. TABLA: suscripciones
CREATE TABLE IF NOT EXISTS suscripciones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tecnico_id  uuid REFERENCES tecnicos(id) ON DELETE CASCADE,
  plan        text NOT NULL CHECK (plan IN ('mensual','trimestral','anual')),
  precio      numeric(10,2) NOT NULL,
  inicio      timestamptz NOT NULL DEFAULT now(),
  fin         timestamptz NOT NULL,
  estado      text NOT NULL DEFAULT 'activo'
              CHECK (estado IN ('activo','cancelado','expirado')),
  creado_en   timestamptz DEFAULT now()
);

-- 2. RLS para suscripciones
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;

-- tecnicos.id = profiles.id = auth.uid(), por eso comparamos directo
DROP POLICY IF EXISTS suscripciones_select ON suscripciones;
CREATE POLICY suscripciones_select ON suscripciones FOR SELECT
  USING (
    auth.uid() = tecnico_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS suscripciones_insert ON suscripciones;
CREATE POLICY suscripciones_insert ON suscripciones FOR INSERT
  WITH CHECK (auth.uid() = tecnico_id);

-- 3. COLUMNAS en tecnicos (si no existen)
ALTER TABLE tecnicos
  ADD COLUMN IF NOT EXISTS es_premium    boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_hasta timestamptz;

-- 4. FUNCION: activar_premium
-- Activa el estado premium del tecnico cuando contrata un plan
CREATE OR REPLACE FUNCTION activar_premium(
  p_tecnico_id uuid,
  p_plan text,
  p_precio numeric
)
RETURNS uuid AS $$
DECLARE
  v_duracion_dias integer;
  v_fin timestamptz;
  v_sub_id uuid;
BEGIN
  -- Calcular duracion segun plan
  v_duracion_dias := CASE p_plan
    WHEN 'mensual'     THEN 30
    WHEN 'trimestral'  THEN 90
    WHEN 'anual'       THEN 365
    ELSE 30
  END;

  v_fin := now() + (v_duracion_dias || ' days')::interval;

  -- Cancelar suscripcion activa anterior si la hay
  UPDATE suscripciones
  SET estado = 'cancelado'
  WHERE tecnico_id = p_tecnico_id AND estado = 'activo';

  -- Crear nueva suscripcion
  INSERT INTO suscripciones (tecnico_id, plan, precio, inicio, fin, estado)
  VALUES (p_tecnico_id, p_plan, p_precio, now(), v_fin, 'activo')
  RETURNING id INTO v_sub_id;

  -- Activar premium en el tecnico
  UPDATE tecnicos
  SET es_premium = true, premium_hasta = v_fin
  WHERE id = p_tecnico_id;

  -- Registrar ingreso de plataforma
  INSERT INTO ingresos_plataforma (tipo, monto, descripcion, referencia_id)
  VALUES ('suscripcion', p_precio, 'Suscripcion ' || p_plan || ' tecnico #' || p_tecnico_id, v_sub_id);

  RETURN v_sub_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNCION: verificar_suscripciones_expiradas (ejecutar con cron diario)
-- Desactiva tecnicos cuya suscripcion ya vencio
CREATE OR REPLACE FUNCTION verificar_suscripciones_expiradas()
RETURNS void AS $$
BEGIN
  -- Marcar suscripciones vencidas
  UPDATE suscripciones
  SET estado = 'expirado'
  WHERE estado = 'activo' AND fin < now();

  -- Quitar premium a tecnicos sin suscripcion activa
  UPDATE tecnicos t
  SET es_premium = false, premium_hasta = null
  WHERE t.es_premium = true
    AND NOT EXISTS (
      SELECT 1 FROM suscripciones s
      WHERE s.tecnico_id = t.id AND s.estado = 'activo' AND s.fin >= now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
