-- =============================================================
-- ChambaYA -- Modulo de Pagos y Comisiones (10%)
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- =============================================================

-- 1. TABLA: pagos
-- Registra cada transaccion de pago cuando el cliente confirma el servicio
CREATE TABLE IF NOT EXISTS pagos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id    uuid REFERENCES solicitudes(id) ON DELETE CASCADE,
  cliente_id      uuid REFERENCES profiles(id),
  tecnico_id      uuid REFERENCES profiles(id),
  monto_total     numeric(12,2) NOT NULL CHECK (monto_total > 0),
  comision        numeric(12,2) NOT NULL,
  monto_tecnico   numeric(12,2) NOT NULL,
  estado          text NOT NULL DEFAULT 'completado'
                  CHECK (estado IN ('pendiente','completado','reembolsado')),
  metodo_pago     text DEFAULT 'plataforma',
  referencia      text,
  creado_en       timestamptz DEFAULT now(),
  actualizado_en  timestamptz DEFAULT now()
);

-- 2. TABLA: ingresos_plataforma
-- Consolida todos los ingresos: comisiones, publicidad, suscripciones
CREATE TABLE IF NOT EXISTS ingresos_plataforma (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo          text NOT NULL CHECK (tipo IN ('comision','publicidad','suscripcion')),
  monto         numeric(12,2) NOT NULL,
  descripcion   text,
  referencia_id uuid,
  fecha         timestamptz DEFAULT now()
);

-- 3. TABLA: saldo_tecnicos
-- Saldo disponible y total historico de cada tecnico
CREATE TABLE IF NOT EXISTS saldo_tecnicos (
  tecnico_id       uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  saldo_disponible numeric(12,2) NOT NULL DEFAULT 0,
  saldo_total      numeric(12,2) NOT NULL DEFAULT 0,
  ultima_ganancia  timestamptz,
  actualizado_en   timestamptz DEFAULT now()
);

-- 4. FUNCION: calcular_comision
-- Se dispara cuando se inserta un pago: registra ingreso y actualiza saldo
CREATE OR REPLACE FUNCTION calcular_comision()
RETURNS TRIGGER AS $$
BEGIN
  -- 4a. Insertar en ingresos_plataforma (la comision del 10%)
  INSERT INTO ingresos_plataforma (tipo, monto, descripcion, referencia_id)
  VALUES (
    'comision',
    NEW.comision,
    'Comision 10% de servicio #' || NEW.solicitud_id,
    NEW.id
  );

  -- 4b. Crear o actualizar el saldo del tecnico
  INSERT INTO saldo_tecnicos (tecnico_id, saldo_disponible, saldo_total, ultima_ganancia)
  VALUES (NEW.tecnico_id, NEW.monto_tecnico, NEW.monto_tecnico, now())
  ON CONFLICT (tecnico_id) DO UPDATE
    SET saldo_disponible = saldo_tecnicos.saldo_disponible + NEW.monto_tecnico,
        saldo_total      = saldo_tecnicos.saldo_total      + NEW.monto_tecnico,
        ultima_ganancia  = now(),
        actualizado_en   = now();

  -- 4c. Actualizar campos en solicitudes
  UPDATE solicitudes
  SET comision_plataforma = NEW.comision,
      ganancia_tecnico    = NEW.monto_tecnico,
      pago_liberado       = true
  WHERE id = NEW.solicitud_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. TRIGGER: after_pago_insert
DROP TRIGGER IF EXISTS after_pago_insert ON pagos;
CREATE TRIGGER after_pago_insert
  AFTER INSERT ON pagos
  FOR EACH ROW EXECUTE FUNCTION calcular_comision();

-- 6. FUNCION: registrar_ingreso
-- Llamada manualmente para ingresos de publicidad o suscripciones
CREATE OR REPLACE FUNCTION registrar_ingreso(
  p_tipo text,
  p_monto numeric,
  p_descripcion text DEFAULT NULL,
  p_referencia_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO ingresos_plataforma (tipo, monto, descripcion, referencia_id)
  VALUES (p_tipo, p_monto, p_descripcion, p_referencia_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Eliminar vista anterior si existia
DROP VIEW IF EXISTS resumen_ganancias_tecnico;

-- 8. COLUMNAS adicionales en solicitudes (si no existen)
ALTER TABLE solicitudes
  ADD COLUMN IF NOT EXISTS comision_plataforma numeric(12,2),
  ADD COLUMN IF NOT EXISTS ganancia_tecnico    numeric(12,2),
  ADD COLUMN IF NOT EXISTS pago_liberado       boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirmado_cliente  boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS precio_acordado     numeric(12,2);

-- 9. RLS (Row Level Security)
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos_plataforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldo_tecnicos ENABLE ROW LEVEL SECURITY;

-- Pagos: el cliente y el tecnico del pago pueden verlos, y el admin
DROP POLICY IF EXISTS pagos_select ON pagos;
CREATE POLICY pagos_select ON pagos FOR SELECT
  USING (
    auth.uid() = cliente_id OR
    auth.uid() = tecnico_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Pagos: solo el cliente puede insertar su propio pago
DROP POLICY IF EXISTS pagos_insert ON pagos;
CREATE POLICY pagos_insert ON pagos FOR INSERT
  WITH CHECK (auth.uid() = cliente_id);

-- Ingresos: solo admin
DROP POLICY IF EXISTS ingresos_select ON ingresos_plataforma;
CREATE POLICY ingresos_select ON ingresos_plataforma FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS ingresos_insert ON ingresos_plataforma;
CREATE POLICY ingresos_insert ON ingresos_plataforma FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Saldo: el propio tecnico o admin
DROP POLICY IF EXISTS saldo_select ON saldo_tecnicos;
CREATE POLICY saldo_select ON saldo_tecnicos FOR SELECT
  USING (
    auth.uid() = tecnico_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
