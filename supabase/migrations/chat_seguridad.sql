-- =============================================================
-- ChambaYA -- Sistema Anti-Evasion y Seguridad
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- =============================================================

-- 1. TABLA: alertas_seguridad
-- Registra los intentos de evasion de comision (compartir datos de contacto)
CREATE TABLE IF NOT EXISTS alertas_seguridad (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  motivo        text NOT NULL,
  mensaje_texto text,
  creado_en     timestamptz DEFAULT now()
);

-- RLS para alertas (solo admin puede verlas)
ALTER TABLE alertas_seguridad ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS alertas_select ON alertas_seguridad;
CREATE POLICY alertas_select ON alertas_seguridad FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. COLUMNA: estado_cuenta en perfiles
-- Permite bloquear cuentas que subvierten las reglas
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS estado_cuenta text DEFAULT 'activo' 
  CHECK (estado_cuenta IN ('activo', 'suspendido'));

-- 3. FUNCION Y TRIGGER: procesar_mensaje_bloqueado
-- Cuando se inserta un mensaje bloqueado, registra una alerta.
-- Si el usuario acumula 3 alertas, se suspende automaticamente su cuenta.
CREATE OR REPLACE FUNCTION procesar_mensaje_bloqueado()
RETURNS TRIGGER AS $$
DECLARE
  v_alertas INT;
BEGIN
  IF NEW.bloqueado = true AND NEW.tiene_contacto = true THEN
    -- A) Registrar alerta
    INSERT INTO alertas_seguridad (usuario_id, motivo, mensaje_texto)
    VALUES (NEW.emisor_id, 'Intento de evasion de comision (compartir contacto)', NEW.contenido);

    -- B) Contar total de alertas del usuario
    SELECT COUNT(*) INTO v_alertas
    FROM alertas_seguridad
    WHERE usuario_id = NEW.emisor_id;

    -- C) Si llega a 3 intentos, suspender cuenta automaticamente
    IF v_alertas >= 3 THEN
      UPDATE profiles SET estado_cuenta = 'suspendido' WHERE id = NEW.emisor_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_mensaje_bloqueado ON mensajes;
CREATE TRIGGER tr_mensaje_bloqueado
  AFTER INSERT ON mensajes
  FOR EACH ROW EXECUTE FUNCTION procesar_mensaje_bloqueado();
