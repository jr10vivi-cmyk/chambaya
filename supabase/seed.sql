-- =============================================================
-- ChambaYA — Seed de datos de prueba
-- Contraseña de todos los usuarios: Test1234!
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =============================================================

-- Limpiar datos existentes (en orden por FK)
DELETE FROM auth.identities   WHERE provider_id IN ('admin@chambaya.pe','carlos.quispe@tecnico.com','miguel.torres@tecnico.com','jose.mamani@tecnico.com','luis.vargas@tecnico.com','pedro.flores@tecnico.com','ana.garcia@cliente.com','maria.lopez@cliente.com','roberto.silva@cliente.com');
DELETE FROM mensajes          WHERE conversacion_id IN (SELECT id FROM conversaciones WHERE cliente_id IN ('00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000023'));
DELETE FROM conversaciones    WHERE cliente_id IN ('00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000023');
DELETE FROM resenas           WHERE cliente_id IN ('00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000023');
DELETE FROM pagos             WHERE cliente_id IN ('00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000023');
DELETE FROM solicitudes       WHERE cliente_id IN ('00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000023');
DELETE FROM suscripciones     WHERE tecnico_id IN ('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000012');
DELETE FROM saldo_tecnicos    WHERE tecnico_id IN ('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000015');
DELETE FROM tecnico_categorias WHERE tecnico_id IN ('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000015');
DELETE FROM tecnicos          WHERE id IN ('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000015');
DELETE FROM publicidades      WHERE id IN (SELECT id FROM publicidades WHERE titulo LIKE '[SEED]%');
DELETE FROM ingresos_plataforma WHERE descripcion LIKE '[SEED]%';
DELETE FROM profiles          WHERE id IN ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000023');
DELETE FROM auth.users        WHERE id IN ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000023');
DELETE FROM categorias        WHERE id IN ('00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000033','00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000035','00000000-0000-0000-0000-000000000036','00000000-0000-0000-0000-000000000037','00000000-0000-0000-0000-000000000038');

-- =============================================================
-- AUTH USERS  (contraseña: Test1234!)
-- =============================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
-- Admin
('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000001','authenticated','authenticated',
 'admin@chambaya.pe', crypt('Test1234!', gen_salt('bf')),
 now(), now(), now(),
 '{"provider":"email","providers":["email"]}',
 '{"nombre":"Admin","apellido":"ChambaYA","role":"admin"}',
 false,'','','',''),

-- Técnicos
('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000011','authenticated','authenticated',
 'carlos.quispe@tecnico.com', crypt('Test1234!', gen_salt('bf')),
 now(), now(), now(),
 '{"provider":"email","providers":["email"]}',
 '{"nombre":"Carlos","apellido":"Quispe","role":"tecnico"}',
 false,'','','',''),

('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000012','authenticated','authenticated',
 'miguel.torres@tecnico.com', crypt('Test1234!', gen_salt('bf')),
 now(), now(), now(),
 '{"provider":"email","providers":["email"]}',
 '{"nombre":"Miguel","apellido":"Torres","role":"tecnico"}',
 false,'','','',''),

('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000013','authenticated','authenticated',
 'jose.mamani@tecnico.com', crypt('Test1234!', gen_salt('bf')),
 now(), now(), now(),
 '{"provider":"email","providers":["email"]}',
 '{"nombre":"José","apellido":"Mamani","role":"tecnico"}',
 false,'','','',''),

('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000014','authenticated','authenticated',
 'luis.vargas@tecnico.com', crypt('Test1234!', gen_salt('bf')),
 now(), now(), now(),
 '{"provider":"email","providers":["email"]}',
 '{"nombre":"Luis","apellido":"Vargas","role":"tecnico"}',
 false,'','','',''),

('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000015','authenticated','authenticated',
 'pedro.flores@tecnico.com', crypt('Test1234!', gen_salt('bf')),
 now(), now(), now(),
 '{"provider":"email","providers":["email"]}',
 '{"nombre":"Pedro","apellido":"Flores","role":"tecnico"}',
 false,'','','',''),

-- Clientes
('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000021','authenticated','authenticated',
 'ana.garcia@cliente.com', crypt('Test1234!', gen_salt('bf')),
 now(), now(), now(),
 '{"provider":"email","providers":["email"]}',
 '{"nombre":"Ana","apellido":"García","role":"cliente"}',
 false,'','','',''),

('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000022','authenticated','authenticated',
 'maria.lopez@cliente.com', crypt('Test1234!', gen_salt('bf')),
 now(), now(), now(),
 '{"provider":"email","providers":["email"]}',
 '{"nombre":"María","apellido":"López","role":"cliente"}',
 false,'','','',''),

('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000023','authenticated','authenticated',
 'roberto.silva@cliente.com', crypt('Test1234!', gen_salt('bf')),
 now(), now(), now(),
 '{"provider":"email","providers":["email"]}',
 '{"nombre":"Roberto","apellido":"Silva","role":"cliente"}',
 false,'','','','');

-- =============================================================
-- AUTH IDENTITIES
-- =============================================================

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
VALUES
('admin@chambaya.pe',        '00000000-0000-0000-0000-000000000001', '{"sub":"00000000-0000-0000-0000-000000000001","email":"admin@chambaya.pe"}',        'email', now(), now(), now(), gen_random_uuid()),
('carlos.quispe@tecnico.com','00000000-0000-0000-0000-000000000011', '{"sub":"00000000-0000-0000-0000-000000000011","email":"carlos.quispe@tecnico.com"}','email', now(), now(), now(), gen_random_uuid()),
('miguel.torres@tecnico.com','00000000-0000-0000-0000-000000000012', '{"sub":"00000000-0000-0000-0000-000000000012","email":"miguel.torres@tecnico.com"}','email', now(), now(), now(), gen_random_uuid()),
('jose.mamani@tecnico.com',  '00000000-0000-0000-0000-000000000013', '{"sub":"00000000-0000-0000-0000-000000000013","email":"jose.mamani@tecnico.com"}',  'email', now(), now(), now(), gen_random_uuid()),
('luis.vargas@tecnico.com',  '00000000-0000-0000-0000-000000000014', '{"sub":"00000000-0000-0000-0000-000000000014","email":"luis.vargas@tecnico.com"}',  'email', now(), now(), now(), gen_random_uuid()),
('pedro.flores@tecnico.com', '00000000-0000-0000-0000-000000000015', '{"sub":"00000000-0000-0000-0000-000000000015","email":"pedro.flores@tecnico.com"}', 'email', now(), now(), now(), gen_random_uuid()),
('ana.garcia@cliente.com',   '00000000-0000-0000-0000-000000000021', '{"sub":"00000000-0000-0000-0000-000000000021","email":"ana.garcia@cliente.com"}',   'email', now(), now(), now(), gen_random_uuid()),
('maria.lopez@cliente.com',  '00000000-0000-0000-0000-000000000022', '{"sub":"00000000-0000-0000-0000-000000000022","email":"maria.lopez@cliente.com"}',  'email', now(), now(), now(), gen_random_uuid()),
('roberto.silva@cliente.com','00000000-0000-0000-0000-000000000023', '{"sub":"00000000-0000-0000-0000-000000000023","email":"roberto.silva@cliente.com"}','email', now(), now(), now(), gen_random_uuid());

-- =============================================================
-- PROFILES
-- =============================================================

INSERT INTO profiles (id, email, nombre, apellido, role, telefono, ciudad, departamento, activo, estado_cuenta, creado_en)
VALUES
('00000000-0000-0000-0000-000000000001','admin@chambaya.pe',        'Admin',   'ChambaYA','admin',  '999000001','Lima','Lima',true,'activo', now() - interval '90 days'),
('00000000-0000-0000-0000-000000000011','carlos.quispe@tecnico.com','Carlos',  'Quispe',  'tecnico','987654301','Lima','Lima',true,'activo', now() - interval '80 days'),
('00000000-0000-0000-0000-000000000012','miguel.torres@tecnico.com','Miguel',  'Torres',  'tecnico','987654302','Lima','Lima',true,'activo', now() - interval '75 days'),
('00000000-0000-0000-0000-000000000013','jose.mamani@tecnico.com',  'José',    'Mamani',  'tecnico','987654303','Lima','Lima',true,'activo', now() - interval '60 days'),
('00000000-0000-0000-0000-000000000014','luis.vargas@tecnico.com',  'Luis',    'Vargas',  'tecnico','987654304','Lima','Lima',true,'activo', now() - interval '50 days'),
('00000000-0000-0000-0000-000000000015','pedro.flores@tecnico.com', 'Pedro',   'Flores',  'tecnico','987654305','Lima','Lima',true,'activo', now() - interval '45 days'),
('00000000-0000-0000-0000-000000000021','ana.garcia@cliente.com',   'Ana',     'García',  'cliente','987654321','Lima','Lima',true,'activo', now() - interval '70 days'),
('00000000-0000-0000-0000-000000000022','maria.lopez@cliente.com',  'María',   'López',   'cliente','987654322','Lima','Lima',true,'activo', now() - interval '65 days'),
('00000000-0000-0000-0000-000000000023','roberto.silva@cliente.com','Roberto', 'Silva',   'cliente','987654323','Lima','Lima',true,'activo', now() - interval '55 days');

-- =============================================================
-- TECNICOS
-- =============================================================
-- Coordenadas Lima: San Isidro, Miraflores, Surco, Jesús María, San Borja

INSERT INTO tecnicos (id, descripcion, disponible, estado_verificacion, experiencia_anos,
  calificacion_promedio, total_resenas, total_trabajos, tarifa_hora, tarifa_minima,
  radio_servicio_km, lat, lng, es_premium, premium_hasta, creado_en)
VALUES
-- Carlos Quispe - Electricista - Premium - San Isidro
('00000000-0000-0000-0000-000000000011',
 'Electricista certificado con 8 años de experiencia. Instalaciones residenciales y comerciales, tableros eléctricos, sistema de cámaras.',
 true,'aprobado',8, 4.8,24,31, 80,120, 15, -12.0971,-77.0380, true, now() + interval '60 days',
 now() - interval '80 days'),

-- Miguel Torres - Gasfitero/Plomero - Premium - Miraflores
('00000000-0000-0000-0000-000000000012',
 'Gasfitero con 6 años de experiencia. Reparación de tuberías, instalación de baños completos, detección de filtraciones.',
 true,'aprobado',6, 4.6,18,22, 70,100, 12, -12.1219,-77.0287, true, now() + interval '25 days',
 now() - interval '75 days'),

-- José Mamani - Cerrajero - Surco
('00000000-0000-0000-0000-000000000013',
 'Cerrajero profesional, apertura de puertas, cambio de chapa, duplicado de llaves. Atención 24 horas.',
 true,'aprobado',4, 4.5,10,14, 60,80, 10, -12.1559,-76.9819, false, null,
 now() - interval '60 days'),

-- Luis Vargas - Pintor - Jesús María
('00000000-0000-0000-0000-000000000014',
 'Pintor con amplia experiencia en pintura de interiores y exteriores. Acabados de calidad, puntual y limpio.',
 true,'pendiente',5, 0,0,0, 50,150, 8, -12.0696,-77.0472, false, null,
 now() - interval '50 days'),

-- Pedro Flores - Carpintero - San Borja
('00000000-0000-0000-0000-000000000015',
 'Carpintero con especialidad en muebles a medida, puertas, ventanas y reparaciones de madera en general.',
 false,'aprobado',10, 4.3,7,9, 65,90, 10, -12.1043,-76.9970, false, null,
 now() - interval '45 days');

-- =============================================================
-- CATEGORIAS
-- =============================================================

INSERT INTO categorias (id, nombre, descripcion, icono, activo)
VALUES
('00000000-0000-0000-0000-000000000031','Electricidad',  'Instalaciones y reparaciones eléctricas','⚡',true),
('00000000-0000-0000-0000-000000000032','Gasfitería',    'Plomería, tuberías y sanitarios',        '🔧',true),
('00000000-0000-0000-0000-000000000033','Cerrajería',    'Chapas, llaves y seguridad',             '🔑',true),
('00000000-0000-0000-0000-000000000034','Pintura',       'Pintura interior y exterior',            '🖌️',true),
('00000000-0000-0000-0000-000000000035','Carpintería',   'Muebles y trabajos en madera',           '🪚',true),
('00000000-0000-0000-0000-000000000036','Limpieza',      'Limpieza del hogar y oficinas',          '🧹',true),
('00000000-0000-0000-0000-000000000037','Jardinería',    'Jardines, poda y paisajismo',            '🌿',true),
('00000000-0000-0000-0000-000000000038','Mudanzas',      'Traslado de muebles y carga',            '📦',true);

-- =============================================================
-- TECNICO_CATEGORIAS
-- =============================================================

INSERT INTO tecnico_categorias (tecnico_id, categoria_id)
VALUES
('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000031'), -- Carlos: Electricidad
('00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000032'), -- Miguel: Gasfitería
('00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000031'), -- Miguel: Electricidad también
('00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000033'), -- José: Cerrajería
('00000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000034'), -- Luis: Pintura
('00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000035'); -- Pedro: Carpintería

-- =============================================================
-- SOLICITUDES  (varios estados, distribuidas en ~90 días)
-- =============================================================

INSERT INTO solicitudes (
  id, titulo, descripcion, direccion, lat, lng,
  cliente_id, tecnico_id, categoria_id,
  estado, presupuesto_cliente, precio_acordado,
  comision_plataforma, ganancia_tecnico, confirmado_cliente, pago_liberado,
  fecha_solicitud, fecha_aceptado, fecha_inicio, fecha_completado
) VALUES

-- ── COMPLETADAS (con pago) ───────────────────────────────────

-- S01: Ana → Carlos (Electricidad) completada hace 85 días
('00000000-0000-0000-0000-000000000101',
 'Instalación de tomacorrientes en sala',
 'Necesito instalar 4 tomacorrientes nuevos en la sala de estar. El cableado ya está expuesto.',
 'Av. Javier Prado Este 1234, San Isidro', -12.0971, -77.0380,
 '00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000031',
 'completado',150,180, 18,162, true,true,
 now()-interval '88 days', now()-interval '87 days', now()-interval '86 days', now()-interval '85 days'),

-- S02: María → Carlos (Electricidad) completada hace 70 días
('00000000-0000-0000-0000-000000000102',
 'Revisión de tablero eléctrico',
 'El tablero principal hace ruido extraño y a veces salta el diferencial. Necesito revisión completa.',
 'Calle Las Begonias 450, San Isidro', -12.0971, -77.0380,
 '00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000031',
 'completado',200,250, 25,225, true,true,
 now()-interval '73 days', now()-interval '72 days', now()-interval '71 days', now()-interval '70 days'),

-- S03: Roberto → Carlos (Electricidad) completada hace 55 días
('00000000-0000-0000-0000-000000000103',
 'Instalación de sistema de cámaras',
 'Instalar 4 cámaras IP en exterior del local comercial con cableado oculto.',
 'Jr. Ucayali 450, Centro de Lima', -12.0464, -77.0428,
 '00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000031',
 'completado',400,450, 45,405, true,true,
 now()-interval '58 days', now()-interval '57 days', now()-interval '56 days', now()-interval '55 days'),

-- S04: Ana → Miguel (Gasfitería) completada hace 60 días
('00000000-0000-0000-0000-000000000104',
 'Reparación de fuga de agua en cocina',
 'Hay una fuga debajo del lavatorio de cocina que está mojando el mueble.',
 'Av. Benavides 1500, Miraflores', -12.1219, -77.0287,
 '00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000032',
 'completado',100,120, 12,108, true,true,
 now()-interval '63 days', now()-interval '62 days', now()-interval '61 days', now()-interval '60 days'),

-- S05: Roberto → Miguel (Gasfitería) completada hace 40 días
('00000000-0000-0000-0000-000000000105',
 'Instalación de calentador de agua',
 'Cambiar el terma antigua por una nueva de 50 litros. Ya tengo el equipo comprado.',
 'Calle Berlín 450, Miraflores', -12.1219, -77.0287,
 '00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000032',
 'completado',200,220, 22,198, true,true,
 now()-interval '43 days', now()-interval '42 days', now()-interval '41 days', now()-interval '40 days'),

-- S06: María → José (Cerrajería) completada hace 30 días
('00000000-0000-0000-0000-000000000106',
 'Cambio de chapa de puerta principal',
 'La chapa de la puerta principal está malograda, no abre con facilidad.',
 'Av. Caminos del Inca 750, Surco', -12.1559, -76.9819,
 '00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000033',
 'completado',80,90, 9,81, true,true,
 now()-interval '33 days', now()-interval '32 days', now()-interval '31 days', now()-interval '30 days'),

-- S07: Ana → José (Cerrajería) completada hace 15 días
('00000000-0000-0000-0000-000000000107',
 'Apertura de puerta de dormitorio',
 'Llave de dormitorio perdida, la puerta tiene seguro doble.',
 'Jr. Colón 789, Barranco', -12.1475, -77.0219,
 '00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000033',
 'completado',60,70, 7,63, true,true,
 now()-interval '16 days', now()-interval '16 days', now()-interval '15 days', now()-interval '15 days'),

-- S08: Roberto → Pedro (Carpintería) completada hace 20 días
('00000000-0000-0000-0000-000000000108',
 'Reparación de puerta de madera',
 'La puerta del baño principal tiene la madera hinchada y no cierra bien.',
 'Av. Guardia Civil 1200, San Borja', -12.1043, -76.9970,
 '00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000035',
 'completado',120,130, 13,117, true,true,
 now()-interval '23 days', now()-interval '22 days', now()-interval '21 days', now()-interval '20 days'),

-- ── EN PROCESO ───────────────────────────────────────────────

-- S09: María → Carlos (Electricidad) en proceso
('00000000-0000-0000-0000-000000000109',
 'Instalación de luces LED en toda la casa',
 'Cambiar todas las luminarias de la casa a tecnología LED. Son 12 puntos de luz.',
 'Calle Porta 180, Miraflores', -12.1219, -77.0287,
 '00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000031',
 'en_proceso',300,320, null,null, false,false,
 now()-interval '5 days', now()-interval '4 days', now()-interval '3 days', null),

-- S10: Ana → Miguel (Gasfitería) en proceso
('00000000-0000-0000-0000-000000000110',
 'Instalación de ducha eléctrica',
 'Instalar ducha eléctrica en baño de visitas. Necesita conexión a 220V.',
 'Av. Ricardo Palma 300, Miraflores', -12.1219, -77.0287,
 '00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000032',
 'en_proceso',150,160, null,null, false,false,
 now()-interval '4 days', now()-interval '3 days', now()-interval '2 days', null),

-- ── ACEPTADAS ────────────────────────────────────────────────

-- S11: Roberto → José (Cerrajería) aceptada
('00000000-0000-0000-0000-000000000111',
 'Duplicado de llaves y cambio de seguro',
 'Necesito 3 copias de llaves y cambiar el seguro de la puerta trasera.',
 'Calle Domingo Orué 145, Surco', -12.1559, -76.9819,
 '00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000033',
 'aceptado',70,null, null,null, false,false,
 now()-interval '2 days', now()-interval '1 day', null, null),

-- ── PENDIENTES ───────────────────────────────────────────────

-- S12: María → sin asignar (Pintura)
('00000000-0000-0000-0000-000000000112',
 'Pintura de sala y comedor',
 'Pintar sala y comedor, aprox 50 m². Pared en buen estado solo necesita una mano.',
 'Av. Dos de Mayo 1265, San Isidro', -12.0971, -77.0380,
 '00000000-0000-0000-0000-000000000022',null,'00000000-0000-0000-0000-000000000034',
 'pendiente',400,null, null,null, false,false,
 now()-interval '1 day', null, null, null),

-- S13: Ana → sin asignar (Limpieza)
('00000000-0000-0000-0000-000000000113',
 'Limpieza profunda de departamento',
 'Limpieza profunda de departamento de 3 habitaciones antes de mudanza.',
 'Av. Arequipa 3500, Miraflores', -12.1219, -77.0287,
 '00000000-0000-0000-0000-000000000021',null,'00000000-0000-0000-0000-000000000036',
 'pendiente',250,null, null,null, false,false,
 now()-interval '6 hours', null, null, null),

-- ── CANCELADA ────────────────────────────────────────────────

-- S14: Roberto → Luis (Pintura) cancelada
('00000000-0000-0000-0000-000000000114',
 'Pintura de fachada exterior',
 'Pintar la fachada del edificio de 3 pisos.',
 'Calle Enrique Palacios 450, Miraflores', -12.1219, -77.0287,
 '00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000034',
 'cancelado',800,null, null,null, false,false,
 now()-interval '20 days', now()-interval '19 days', null, null);

-- =============================================================
-- PAGOS (para solicitudes completadas)
-- =============================================================

INSERT INTO pagos (id, solicitud_id, cliente_id, tecnico_id, monto_total, comision, monto_tecnico, metodo_pago, estado, creado_en)
VALUES
(gen_random_uuid(),'00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000011',180,18,162,'yape','completado',        now()-interval '85 days'),
(gen_random_uuid(),'00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000011',250,25,225,'transferencia','completado', now()-interval '70 days'),
(gen_random_uuid(),'00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000011',450,45,405,'efectivo','completado',       now()-interval '55 days'),
(gen_random_uuid(),'00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000012',120,12,108,'yape','completado',         now()-interval '60 days'),
(gen_random_uuid(),'00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000012',220,22,198,'transferencia','completado',now()-interval '40 days'),
(gen_random_uuid(),'00000000-0000-0000-0000-000000000106','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000013',90,9,81,'efectivo','completado',         now()-interval '30 days'),
(gen_random_uuid(),'00000000-0000-0000-0000-000000000107','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000013',70,7,63,'yape','completado',             now()-interval '15 days'),
(gen_random_uuid(),'00000000-0000-0000-0000-000000000108','00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000015',130,13,117,'efectivo','completado',     now()-interval '20 days');

-- =============================================================
-- INGRESOS PLATAFORMA
-- =============================================================

INSERT INTO ingresos_plataforma (monto, tipo, descripcion, fecha)
VALUES
(18,  'comision', '[SEED] Comisión S01 instalación tomacorrientes',    now()-interval '85 days'),
(25,  'comision', '[SEED] Comisión S02 revisión tablero eléctrico',    now()-interval '70 days'),
(45,  'comision', '[SEED] Comisión S03 instalación cámaras',           now()-interval '55 days'),
(12,  'comision', '[SEED] Comisión S04 reparación fuga cocina',        now()-interval '60 days'),
(22,  'comision', '[SEED] Comisión S05 instalación calentador',        now()-interval '40 days'),
(9,   'comision', '[SEED] Comisión S06 cambio chapa principal',        now()-interval '30 days'),
(7,   'comision', '[SEED] Comisión S07 apertura puerta dormitorio',    now()-interval '15 days'),
(13,  'comision', '[SEED] Comisión S08 reparación puerta madera',      now()-interval '20 days'),
(120, 'suscripcion','[SEED] Suscripción Premium Mensual - Carlos Q.',  now()-interval '30 days'),
(90,  'suscripcion','[SEED] Suscripción Premium Mensual - Miguel T.',  now()-interval '25 days'),
(80,  'publicidad', '[SEED] Campaña banner inicio - ElectroFácil',     now()-interval '45 days'),
(60,  'publicidad', '[SEED] Campaña destacado búsqueda - HomeFix',     now()-interval '20 days');

-- =============================================================
-- SALDO TECNICOS
-- =============================================================

INSERT INTO saldo_tecnicos (tecnico_id, saldo_disponible, saldo_total, ultima_ganancia, actualizado_en)
VALUES
('00000000-0000-0000-0000-000000000011', 792, 792, now()-interval '55 days', now()-interval '55 days'), -- Carlos: 162+225+405
('00000000-0000-0000-0000-000000000012', 306, 306, now()-interval '40 days', now()-interval '40 days'), -- Miguel: 108+198
('00000000-0000-0000-0000-000000000013', 144, 144, now()-interval '15 days', now()-interval '15 days'), -- José: 81+63
('00000000-0000-0000-0000-000000000014',   0,   0, null,                     now()-interval '50 days'), -- Luis: sin completados
('00000000-0000-0000-0000-000000000015', 117, 117, now()-interval '20 days', now()-interval '20 days'); -- Pedro: 117

-- =============================================================
-- RESENAS (solo para solicitudes completadas)
-- =============================================================

INSERT INTO resenas (solicitud_id, cliente_id, tecnico_id, calificacion, comentario, creado_en)
VALUES
('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000011',5,'Excelente trabajo, muy puntual y ordenado. Lo recomiendo totalmente.',               now()-interval '84 days'),
('00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000011',5,'Carlos es un profesional. Revisó todo el tablero y explicó cada detalle.',             now()-interval '69 days'),
('00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000011',4,'Buen trabajo en la instalación de cámaras. Tardó un poco más de lo prometido.',        now()-interval '54 days'),
('00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000012',5,'Miguel llegó puntual y solucionó la fuga en menos de una hora. Muy profesional.',    now()-interval '59 days'),
('00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000012',4,'Buena instalación, el trabajo quedó limpio. Precio justo.',                           now()-interval '39 days'),
('00000000-0000-0000-0000-000000000106','00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000013',5,'José muy rápido y eficiente. La nueva chapa quedó perfecta.',                         now()-interval '29 days'),
('00000000-0000-0000-0000-000000000107','00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000013',4,'Abrió la puerta sin problema. Cobró lo justo y fue rápido.',                           now()-interval '14 days'),
('00000000-0000-0000-0000-000000000108','00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000015',4,'Buena reparación, la puerta cierra perfecto ahora. Precio razonable.',                now()-interval '19 days');

-- =============================================================
-- SUSCRIPCIONES PREMIUM
-- =============================================================

INSERT INTO suscripciones (tecnico_id, plan, precio, inicio, fin, estado, renovacion_automatica)
VALUES
('00000000-0000-0000-0000-000000000011','mensual', 120, now()-interval '30 days', now()+interval '60 days', 'activo',  true),
('00000000-0000-0000-0000-000000000012','mensual',  90, now()-interval '25 days', now()+interval '25 days', 'activo',  false);

-- =============================================================
-- PUBLICIDADES
-- =============================================================

INSERT INTO publicidades (titulo, tipo, posicion, imagen_url, url_destino, costo, activo, impresiones, clicks, fecha_inicio, fecha_fin)
VALUES
('[SEED] ElectroFácil - Materiales Eléctricos',        'banner',    'inicio',  null, '#', 80,  true,  1240, 47, now()-interval '45 days', now()+interval '15 days'),
('[SEED] HomeFix - Herramientas para el Hogar',        'destacado', 'buscar',  null, '#', 60,  true,   820, 31, now()-interval '20 days', now()+interval '40 days'),
('[SEED] AquaService - Especialistas en Gasfitería',   'banner',    'lateral', null, '#', 50,  false, 2100, 88, now()-interval '60 days', now()-interval '5 days'),
('[SEED] PinturasPro - Los mejores acabados',          'popup',     'inicio',  null, '#', 40,  true,   560, 22, now()-interval '10 days', now()+interval '50 days');

-- =============================================================
-- CONVERSACIONES Y MENSAJES
-- =============================================================

INSERT INTO conversaciones (id, cliente_id, tecnico_id, solicitud_id, ultimo_mensaje, ultimo_mensaje_en)
VALUES
('00000000-0000-0000-0000-000000000201',
 '00000000-0000-0000-0000-000000000021',
 '00000000-0000-0000-0000-000000000011',
 '00000000-0000-0000-0000-000000000109',
 '¿A qué hora puedes llegar mañana?',
 now()-interval '2 hours'),

('00000000-0000-0000-0000-000000000202',
 '00000000-0000-0000-0000-000000000022',
 '00000000-0000-0000-0000-000000000012',
 '00000000-0000-0000-0000-000000000110',
 'Perfecto, te espero a las 10am.',
 now()-interval '30 minutes');

INSERT INTO mensajes (conversacion_id, emisor_id, contenido, leido, creado_en)
VALUES
-- Conversación 1: Ana ↔ Carlos (S09 luces LED)
('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000021',
 'Hola Carlos, acabo de aceptar tu propuesta para las luces LED.',true, now()-interval '1 day'),
('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000011',
 'Hola Ana! Perfecto, pasaré a revisar la instalación.',         true, now()-interval '23 hours'),
('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000021',
 '¿A qué hora puedes llegar mañana?',                           false, now()-interval '2 hours'),

-- Conversación 2: María ↔ Miguel (S10 ducha eléctrica)
('00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000022',
 'Hola Miguel, necesito que vengas lo antes posible.',           true, now()-interval '3 hours'),
('00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000012',
 'Claro María, puedo ir mañana a las 10am. ¿Te parece?',        true, now()-interval '2 hours'),
('00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000022',
 'Perfecto, te espero a las 10am.',                             false, now()-interval '30 minutes');

-- =============================================================
-- ACTUALIZAR calificaciones en tecnicos (sync con resenas)
-- =============================================================

UPDATE tecnicos SET
  calificacion_promedio = 4.67,
  total_resenas         = 3,
  total_trabajos        = 3
WHERE id = '00000000-0000-0000-0000-000000000011';  -- Carlos: (5+5+4)/3

UPDATE tecnicos SET
  calificacion_promedio = 4.50,
  total_resenas         = 2,
  total_trabajos        = 2
WHERE id = '00000000-0000-0000-0000-000000000012';  -- Miguel: (5+4)/2

UPDATE tecnicos SET
  calificacion_promedio = 4.50,
  total_resenas         = 2,
  total_trabajos        = 2
WHERE id = '00000000-0000-0000-0000-000000000013';  -- José: (5+4)/2

UPDATE tecnicos SET
  total_trabajos        = 1,
  total_resenas         = 1,
  calificacion_promedio = 4.00
WHERE id = '00000000-0000-0000-0000-000000000015';  -- Pedro: (4)/1
