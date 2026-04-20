-- =============================================================
-- ChambaYA -- Verificación de Identidad (DNI + Selfie)
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- =============================================================

-- 1. Columnas de identidad en tecnicos
ALTER TABLE tecnicos
  ADD COLUMN IF NOT EXISTS dni                  text,
  ADD COLUMN IF NOT EXISTS foto_dni_url         text,   -- frontal del DNI (Storage)
  ADD COLUMN IF NOT EXISTS foto_selfie_url      text,   -- selfie sosteniendo el DNI
  ADD COLUMN IF NOT EXISTS fecha_solicitud_ver  timestamptz,
  ADD COLUMN IF NOT EXISTS notas_verificacion   text;   -- notas del admin al aprobar/rechazar

-- 2. Índice para búsqueda de pendientes en admin
CREATE INDEX IF NOT EXISTS idx_tecnicos_verificacion
  ON tecnicos (estado_verificacion)
  WHERE estado_verificacion = 'pendiente';

-- 3. Función: solicitar_verificacion
--    Técnico llama esta función al subir su DNI y selfie
CREATE OR REPLACE FUNCTION solicitar_verificacion(
  p_tecnico_id    uuid,
  p_dni           text,
  p_foto_dni_url  text,
  p_foto_selfie_url text
)
RETURNS void AS $$
BEGIN
  UPDATE tecnicos
  SET
    dni                 = p_dni,
    foto_dni_url        = p_foto_dni_url,
    foto_selfie_url     = p_foto_selfie_url,
    estado_verificacion = 'pendiente',
    fecha_solicitud_ver = now()
  WHERE id = p_tecnico_id;

  -- Notificar al admin (usuario id del admin puede ser NULL aquí;
  -- la notificación se consulta por role='admin' en el dashboard)
  INSERT INTO notificaciones (usuario_id, tipo, titulo, datos)
  SELECT id, 'verificacion_pendiente',
    'Nuevo técnico solicita verificación de identidad',
    jsonb_build_object('tecnico_id', p_tecnico_id)
  FROM profiles
  WHERE role = 'admin'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Función: resolver_verificacion (uso admin)
CREATE OR REPLACE FUNCTION resolver_verificacion(
  p_tecnico_id  uuid,
  p_decision    text,   -- 'aprobado' | 'rechazado'
  p_notas       text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  IF p_decision NOT IN ('aprobado','rechazado') THEN
    RAISE EXCEPTION 'Decisión inválida';
  END IF;

  UPDATE tecnicos
  SET
    estado_verificacion = p_decision,
    notas_verificacion  = p_notas
  WHERE id = p_tecnico_id;

  -- Notificar al técnico
  INSERT INTO notificaciones (usuario_id, tipo, titulo, datos)
  VALUES (
    p_tecnico_id,
    'verificacion_' || p_decision,
    CASE p_decision
      WHEN 'aprobado'  THEN 'Tu identidad fue verificada. Ya puedes recibir solicitudes.'
      WHEN 'rechazado' THEN 'Tu verificación fue rechazada. Revisa las notas y vuelve a intentarlo.'
    END,
    jsonb_build_object('notas', p_notas)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
