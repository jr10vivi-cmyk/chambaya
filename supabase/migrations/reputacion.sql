-- =============================================================
-- ChambaYA -- Sistema de Reputacion y Calificaciones
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- =============================================================

-- 1. TABLA: resenas (Asegurar que existe con la estructura correcta)
CREATE TABLE IF NOT EXISTS resenas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id  uuid REFERENCES solicitudes(id) ON DELETE CASCADE,
  cliente_id    uuid REFERENCES profiles(id),
  tecnico_id    uuid REFERENCES profiles(id),
  calificacion  integer NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario    text,
  creado_en     timestamptz DEFAULT now()
);

-- 2. RLS para resenas
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS resenas_select ON resenas;
CREATE POLICY resenas_select ON resenas FOR SELECT
  USING (true); -- Cualquiera puede ver las reseñas

DROP POLICY IF EXISTS resenas_insert ON resenas;
CREATE POLICY resenas_insert ON resenas FOR INSERT
  WITH CHECK (auth.uid() = cliente_id);

-- 3. FUNCION: actualizar_reputacion_tecnico
-- Calcula y actualiza el promedio y total de reseñas del técnico automáticamente
CREATE OR REPLACE FUNCTION actualizar_reputacion_tecnico()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tecnicos
  SET 
    calificacion_promedio = (
      SELECT AVG(calificacion)::numeric(3,2)
      FROM resenas
      WHERE tecnico_id = NEW.tecnico_id
    ),
    total_resenas = (
      SELECT COUNT(*)
      FROM resenas
      WHERE tecnico_id = NEW.tecnico_id
    )
  WHERE id = NEW.tecnico_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. TRIGGER: tr_actualizar_reputacion
DROP TRIGGER IF EXISTS tr_actualizar_reputacion ON resenas;
CREATE TRIGGER tr_actualizar_reputacion
  AFTER INSERT OR UPDATE OR DELETE ON resenas
  FOR EACH ROW EXECUTE FUNCTION actualizar_reputacion_tecnico();

-- 5. VISTA: vista_reputacion_tecnicos (Opcional, para reportes)
CREATE OR REPLACE VIEW vista_reputacion_tecnicos WITH (security_invoker = true) AS
SELECT 
  t.id as tecnico_id,
  p.nombre,
  p.apellido,
  t.calificacion_promedio,
  t.total_resenas,
  t.total_trabajos
FROM tecnicos t
JOIN profiles p ON p.id = t.id;
