-- =============================================================
-- ChambaYA -- Escrow Real con Yape/Plin
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- =============================================================

-- 1. Agregar estado 'en_custodia' al ciclo de solicitudes
--    Nuevo flujo: pendiente → aceptado → en_custodia → en_proceso → completado
ALTER TABLE solicitudes
  ADD COLUMN IF NOT EXISTS metodo_pago_cliente   text DEFAULT 'yape'
    CHECK (metodo_pago_cliente IN ('yape','plin')),
  ADD COLUMN IF NOT EXISTS referencia_deposito   text,         -- código operación Yape/Plin
  ADD COLUMN IF NOT EXISTS comprobante_url       text,         -- foto del comprobante (Storage)
  ADD COLUMN IF NOT EXISTS fecha_deposito        timestamptz,  -- cuando el cliente depositó
  ADD COLUMN IF NOT EXISTS monto_depositado      numeric(12,2);-- monto real enviado por el cliente

-- 2. Ampliar CHECK de estado en solicitudes para incluir 'en_custodia'
--    (Si la columna tiene un check constraint existente, lo reemplazamos)
ALTER TABLE solicitudes DROP CONSTRAINT IF EXISTS solicitudes_estado_check;
ALTER TABLE solicitudes
  ADD CONSTRAINT solicitudes_estado_check
  CHECK (estado IN ('pendiente','aceptado','en_custodia','en_proceso','completado','cancelado'));

-- 3. Agregar campo referencia_deposito en pagos para registrar el código Yape/Plin
ALTER TABLE pagos
  ADD COLUMN IF NOT EXISTS referencia_deposito text,
  ADD COLUMN IF NOT EXISTS comprobante_url     text;

-- Actualizar CHECK de metodo_pago para aceptar 'yape' y 'plin' explícitamente
ALTER TABLE pagos DROP CONSTRAINT IF EXISTS pagos_metodo_pago_check;

-- 4. Bucket de Storage para comprobantes de pago (ejecutar también en Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('comprobantes-pago', 'comprobantes-pago', false)
-- ON CONFLICT DO NOTHING;

-- 5. RLS para comprobantes: solo cliente propietario y admin pueden ver
-- CREATE POLICY "comprobantes_cliente" ON storage.objects FOR SELECT
--   USING (bucket_id = 'comprobantes-pago' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Función: registrar_deposito_custodia
--    Llamada por el cliente cuando envía el Yape/Plin; avanza el estado a en_custodia
CREATE OR REPLACE FUNCTION registrar_deposito_custodia(
  p_solicitud_id       uuid,
  p_metodo             text,      -- 'yape' | 'plin'
  p_referencia         text,      -- código de operación
  p_monto              numeric,
  p_comprobante_url    text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE solicitudes
  SET
    estado              = 'en_custodia',
    metodo_pago_cliente = p_metodo,
    referencia_deposito = p_referencia,
    monto_depositado    = p_monto,
    comprobante_url     = p_comprobante_url,
    fecha_deposito      = now()
  WHERE id = p_solicitud_id
    AND estado = 'aceptado';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitud no encontrada o no está en estado aceptado';
  END IF;

  -- Notificar al técnico que el depósito fue recibido
  INSERT INTO notificaciones (usuario_id, tipo, titulo, datos)
  SELECT
    s.tecnico_id,
    'deposito_recibido',
    'Depósito en custodia recibido. Ya puedes iniciar el trabajo.',
    jsonb_build_object('solicitud_id', p_solicitud_id, 'metodo', p_metodo, 'monto', p_monto)
  FROM solicitudes s
  WHERE s.id = p_solicitud_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. El técnico solo puede avanzar a en_proceso si la solicitud está en en_custodia
--    (control a nivel aplicación + función de validación)
CREATE OR REPLACE FUNCTION validar_inicio_trabajo(p_solicitud_id uuid)
RETURNS boolean AS $$
DECLARE
  v_estado text;
BEGIN
  SELECT estado INTO v_estado FROM solicitudes WHERE id = p_solicitud_id;
  RETURN v_estado = 'en_custodia';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
