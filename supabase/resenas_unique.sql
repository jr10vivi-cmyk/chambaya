-- Resenas: eliminar duplicados y añadir restricción única
-- Ejecutar en SQL editor de Supabase (con privilegios de proyecto)

-- 1) listar duplicados (consulta informativa)
SELECT solicitud_id, cliente_id, count(*) FROM public.resenas
GROUP BY solicitud_id, cliente_id HAVING count(*) > 1;

-- 2) eliminar duplicados, dejando la fila más antigua
BEGIN;
WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY solicitud_id, cliente_id
                                ORDER BY creado_en ASC, id ASC) rn
  FROM public.resenas
)
DELETE FROM public.resenas
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 3) crear restricción única
ALTER TABLE IF EXISTS public.resenas
ADD CONSTRAINT IF NOT EXISTS resenas_unique_solicitud_cliente UNIQUE (solicitud_id, cliente_id);
COMMIT;

-- Nota: después de aplicar la restricción, las inserciones duplicadas fallarán con error de constraint.
-- En el frontend se añadió comprobación previa y manejo del error para mostrar mensaje amigable.
