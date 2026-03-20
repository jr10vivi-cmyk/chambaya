-- =============================================================
-- ChambaYA -- Modulo de Publicidad
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- =============================================================

-- 1. TABLA: publicidades
CREATE TABLE IF NOT EXISTS publicidades (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      text NOT NULL,
  descripcion text,
  imagen_url  text,
  url_destino text,
  tipo        text NOT NULL DEFAULT 'banner'
              CHECK (tipo IN ('banner','destacado','popup')),
  posicion    text NOT NULL DEFAULT 'inicio'
              CHECK (posicion IN ('inicio','buscar','lateral')),
  costo       numeric(10,2) DEFAULT 0,
  activo      boolean NOT NULL DEFAULT false,
  clicks      integer NOT NULL DEFAULT 0,
  impresiones integer NOT NULL DEFAULT 0,
  fecha_inicio timestamptz,
  fecha_fin    timestamptz,
  creado_en    timestamptz DEFAULT now()
);

-- 2. RLS
ALTER TABLE publicidades ENABLE ROW LEVEL SECURITY;

-- Solo admin puede gestionar publicidades
DROP POLICY IF EXISTS publicidades_admin ON publicidades;
CREATE POLICY publicidades_admin ON publicidades FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Cualquier usuario autenticado puede ver las activas (para mostrar banners)
DROP POLICY IF EXISTS publicidades_select ON publicidades;
CREATE POLICY publicidades_select ON publicidades FOR SELECT
  USING (
    activo = true
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. FUNCION: registrar_click
-- Incrementa el contador de clicks de un anuncio
CREATE OR REPLACE FUNCTION registrar_click(p_anuncio_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE publicidades
  SET clicks = clicks + 1
  WHERE id = p_anuncio_id AND activo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNCION: registrar_impresion
-- Incrementa el contador de impresiones de un anuncio
CREATE OR REPLACE FUNCTION registrar_impresion(p_anuncio_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE publicidades
  SET impresiones = impresiones + 1
  WHERE id = p_anuncio_id AND activo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
