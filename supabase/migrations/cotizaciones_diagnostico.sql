-- =============================================================
-- ChambaYA -- Cotizaciones Formales + Visita de Diagnóstico
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- =============================================================

-- ── 1. TABLA: cotizaciones ────────────────────────────────────
-- Permite al técnico enviar propuestas de precio y al cliente
-- aceptar, rechazar o hacer una contraoferta dentro de la plataforma

CREATE TABLE IF NOT EXISTS cotizaciones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id    uuid REFERENCES solicitudes(id) ON DELETE CASCADE,
  tecnico_id      uuid REFERENCES profiles(id),
  cliente_id      uuid REFERENCES profiles(id),
  monto           numeric(12,2) NOT NULL CHECK (monto > 0),
  descripcion     text,                        -- detalle del trabajo cotizado
  incluye_visita  boolean DEFAULT false,        -- si incluye visita de diagnóstico
  costo_visita    numeric(10,2) DEFAULT 0,      -- S/. 10-20 según el documento
  estado          text NOT NULL DEFAULT 'propuesta'
                  CHECK (estado IN ('propuesta','aceptada','rechazada','contraoferta')),
  monto_contraoferta numeric(12,2),             -- monto que propone el cliente
  nota_contraoferta  text,
  creado_en       timestamptz DEFAULT now(),
  actualizado_en  timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cotizaciones_select ON cotizaciones;
CREATE POLICY cotizaciones_select ON cotizaciones FOR SELECT
  USING (
    auth.uid() = tecnico_id OR
    auth.uid() = cliente_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS cotizaciones_insert_tecnico ON cotizaciones;
CREATE POLICY cotizaciones_insert_tecnico ON cotizaciones FOR INSERT
  WITH CHECK (auth.uid() = tecnico_id);

DROP POLICY IF EXISTS cotizaciones_update ON cotizaciones;
CREATE POLICY cotizaciones_update ON cotizaciones FOR UPDATE
  USING (auth.uid() = tecnico_id OR auth.uid() = cliente_id);

-- ── 2. Columnas en solicitudes para visita de diagnóstico ─────
ALTER TABLE solicitudes
  ADD COLUMN IF NOT EXISTS requiere_visita_diagnostico boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS costo_visita_diagnostico    numeric(10,2) DEFAULT 15,
  ADD COLUMN IF NOT EXISTS visita_realizada            boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS fecha_visita                timestamptz;

-- ── 3. Función: aceptar_cotizacion ────────────────────────────
-- Cuando el cliente acepta, copia el precio acordado a la solicitud
CREATE OR REPLACE FUNCTION aceptar_cotizacion(p_cotizacion_id uuid)
RETURNS void AS $$
DECLARE
  v_cot cotizaciones%ROWTYPE;
BEGIN
  SELECT * INTO v_cot FROM cotizaciones WHERE id = p_cotizacion_id;

  IF v_cot.id IS NULL THEN
    RAISE EXCEPTION 'Cotización no encontrada';
  END IF;

  -- Marcar cotización como aceptada
  UPDATE cotizaciones
  SET estado = 'aceptada', actualizado_en = now()
  WHERE id = p_cotizacion_id;

  -- Rechazar otras cotizaciones activas de la misma solicitud
  UPDATE cotizaciones
  SET estado = 'rechazada', actualizado_en = now()
  WHERE solicitud_id = v_cot.solicitud_id
    AND id <> p_cotizacion_id
    AND estado = 'propuesta';

  -- Actualizar precio acordado en la solicitud
  UPDATE solicitudes
  SET precio_acordado = v_cot.monto
  WHERE id = v_cot.solicitud_id;

  -- Notificar al técnico
  INSERT INTO notificaciones (usuario_id, tipo, titulo, datos)
  VALUES (
    v_cot.tecnico_id,
    'cotizacion_aceptada',
    'Tu cotización fue aceptada. El cliente procederá con el depósito.',
    jsonb_build_object('cotizacion_id', p_cotizacion_id, 'monto', v_cot.monto)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
