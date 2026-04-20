# ChambaYA

Plataforma marketplace que conecta **clientes** con **tecnicos** de servicios (plomeria, electricidad, gasfiteria, albanileria, etc.) en **Ayacucho, Peru**. Incluye **pagos en custodia (escrow) via Yape/Plin**, **verificacion de identidad con DNI**, **sistema de disputas**, **NPS**, **referidos** y **comision del 10%** sobre cada servicio.

## Stack tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| Backend / DB | Supabase (Auth, PostgreSQL, Realtime, Storage, RPC) |
| Mapas | Leaflet / React-Leaflet |
| State | React Context (auth) + TanStack React Query (data) |
| Pagos | Yape / Plin (wallets peruanas) con escrow manual |
| Notificaciones | Toast (react-hot-toast) + tabla `notificaciones` |

---

## Roles del sistema

El sistema maneja **3 roles**, cada uno con su layout y rutas protegidas:

### Cliente

1. Se registra en `/registro` con `role: cliente` (puede usar **codigo de referido**)
2. **Busca tecnicos** (`/cliente/buscar`) filtrando por categoria, distancia y calificacion
3. Ve el **perfil del tecnico** (`/cliente/tecnico/:id`) con fotos, resenas, tarifa y badge de verificacion
4. **Crea una solicitud** de servicio -> estado `pendiente`
5. Recibe **cotizaciones** del tecnico tras el diagnostico inicial -> aprueba o rechaza
6. **Paga via Yape/Plin** subiendo voucher -> fondos quedan **en custodia** (escrow)
7. **Chat en tiempo real** con el tecnico (`/cliente/chat/:conversacionId`)
8. Al finalizar: **libera los fondos**, deja **resena** y **NPS** (0-10)
9. Si hay problemas: **abre una disputa** (motivo + descripcion)
10. Consulta su **historial** de trabajos

### Tecnico

1. Se registra -> se crea perfil + fila en tabla `tecnicos` (verificacion `pendiente`)
2. Completa su **perfil** (`/tecnico/perfil`): categorias, tarifa, fotos, ubicacion
3. **Verifica su identidad** subiendo DNI + selfie (revision admin)
4. Recibe **solicitudes** (`/tecnico/solicitudes`) -> acepta o rechaza
5. Envia **cotizacion** al cliente con desglose de costos
6. Tras aprobacion + pago en custodia: ejecuta el trabajo (`/tecnico/trabajos`)
7. Marca como completado -> espera liberacion de fondos
8. Ve sus **ganancias** y saldo (`/tecnico/ganancias`) - 10% comision plataforma
9. **Chat** con clientes
10. Puede suscribirse a **planes premium** (`/tecnico/planes`) para mayor visibilidad
11. Gana recompensas por **referir** nuevos usuarios

### Admin

- **Dashboard** con estadisticas generales
- CRUD de **tecnicos** (verificacion / suspension), **clientes**, **servicios** y **categorias**
- **Verificaciones** de identidad pendientes (aprobar/rechazar DNI)
- **Disputas** abiertas (resolver a favor cliente o tecnico)
- Gestion de **ingresos** de la plataforma (comisiones)
- **Publicidad** (banners / anuncios)
- **Suscripciones** premium
- **Reportes** con exportacion CSV

---

## Funcionalidades clave

| # | Funcionalidad | Detalle |
|---|---------------|---------|
| 1 | **Escrow Yape/Plin** | Cliente paga, fondos retenidos hasta confirmacion |
| 2 | **Cotizaciones** | Tecnico envia presupuesto antes de iniciar |
| 3 | **Verificacion DNI** | Subida de DNI + selfie con aprobacion admin |
| 4 | **Disputas** | Sistema de reclamos con SLA 48h y resolucion admin |
| 5 | **NPS 0-10** | Medicion de satisfaccion separada de la resena |
| 6 | **Referidos** | Codigo unico autogenerado, recompensa por nuevo registro |
| 7 | **Chat realtime** | Supabase Realtime con alertas de seguridad |
| 8 | **Geolocalizacion** | Filtro por distancia con Leaflet |
| 9 | **Suscripciones** | Planes premium para tecnicos (visibilidad) |
| 10 | **Comision 10%** | Calculada y registrada automaticamente |

---

## Diagrama de flujo de navegacion

```
+-----------------------------------------------------------------------+
|                          PAGINAS PUBLICAS                             |
|                                                                       |
|   /            /login         /registro      /terminos    /privacidad |
+---+-------------+----------------+----------------+----------+--------+
    |             |                |
    |   +---------v---------+      |
    |   |  Supabase Auth    |<-----+
    |   |  signIn / signUp  |
    |   +---------+---------+
    |             |
    |    +--------v--------+
    |    |  profiles.role  |
    |    +---+----+----+---+
    |        |    |    |
    v        v    |    v
  +-----+ +-----+ |  +--------+
  |Home | |ADMIN| |  | CLIENT |
  |  /  | |/admin |  |/cliente|
  +-----+ +--+--+ |  +---+----+
             |    |      |
             | +--v---+  |
             | |TECNI.|  |
             | |/tec. |  |
             | +--+---+  |
             |    |      |
   +---------+    |      +---------------+
   v              v                      v
+----------+ +----------+         +-----------+
|Dashboard | |Dashboard |         |Dashboard  |
|Tecnicos  | |Perfil    |         |Buscar     |
|Clientes  | |Solicitud.|         |Solicitud. |
|Servicios | |Trabajos  |         |Historial  |
|Categorias| |Ganancias |         |TecnicoPerf|
|Verificac.| |Planes    |         |Chat       |
|Disputas  | |Chat      |         +-----------+
|Ingresos  | +----------+
|Publicidad|
|Suscripc. |
|Reportes  |
+----------+
```

---

## Flujo principal: ciclo de una solicitud (con escrow)

```
 CLIENTE                         SISTEMA                        TECNICO
    |                               |                               |
    |  1. Buscar tecnico            |                               |
    |----------------------------->>|                               |
    |                               |                               |
    |  2. Crear solicitud           |                               |
    |----------------------------->>|  3. Notificar solicitud       |
    |                               |----------------------------->>|
    |                               |                               |
    |                               |  4. Aceptar + cotizar         |
    |                               |<<-----------------------------|
    |  5. Aprobar cotizacion        |                               |
    |----------------------------->>|                               |
    |                               |                               |
    |  6. Pagar Yape/Plin (voucher) |                               |
    |----------------------------->>|  Fondos -> CUSTODIA           |
    |                               |  (estado: en_custodia)        |
    |                               |                               |
    |       7. Chat en tiempo real (Supabase Realtime)              |
    |<<---------------------------->>|<<--------------------------->>|
    |                               |                               |
    |                               |  8. Marcar completado         |
    |                               |<<-----------------------------|
    |                               |                               |
    |  9. Liberar fondos + resena   |                               |
    |     + NPS (0-10)              |                               |
    |----------------------------->>|  10. Liberar 90% al tecnico   |
    |                               |      Registrar 10% comision   |
    |                               |----------------------------->>|
    |                               |                               |
    |  ALT: Abrir disputa           |                               |
    |----------------------------->>|  Admin resuelve (48h SLA)     |
    |                               |  -> reembolso o liberacion    |
```

## Ciclo de estados de una solicitud

```
pendiente --> aceptado --> en_custodia --> en_proceso --> completado
    |             |              |              |             |
    |             |              |              |             v
    |             |              |              |          (cerrado)
    +----+--------+--------+-----+--------+-----+
         |                 |              |
         v                 v              v
     cancelado         disputa        reembolsado
```

---

## Modelo de datos (tablas principales)

| Tabla | Proposito |
|-------|-----------|
| `profiles` | Datos de usuario + `codigo_referido` + `referido_por` + `origen_registro` |
| `tecnicos` | Extension del perfil tecnico (tarifa, ubicacion, verificacion, bio) |
| `categorias` | Categorias de servicio (electricidad, plomeria, albanileria, etc.) |
| `tecnico_categorias` | Relacion N:N tecnico - categoria |
| `solicitudes` | Peticiones de servicio cliente -> tecnico con estado |
| `cotizaciones` | Presupuestos enviados por el tecnico (aprobacion del cliente) |
| `pagos` | Vouchers Yape/Plin + estado escrow |
| `conversaciones` / `mensajes` | Chat en tiempo real |
| `resenas` | Calificaciones y comentarios |
| `nps_respuestas` | NPS 0-10 separado de la resena cualitativa |
| `disputas` | Reclamos con motivo, descripcion, decision admin |
| `verificaciones_identidad` | DNI + selfie subidos por el tecnico |
| `ingresos_plataforma` | Comisiones cobradas por la plataforma |
| `saldo_tecnicos` | Balance acumulado del tecnico |
| `publicidades` | Banners publicitarios |
| `suscripciones` | Planes premium de tecnicos |
| `alertas_seguridad` | Moderacion y seguridad del chat |
| `notificaciones` | Notificaciones in-app |
| `tecnico_fotos` | Portafolio de fotos del tecnico |

### Funciones SQL relevantes

- `handle_new_user()` -> trigger `on_auth_user_created` que crea `profiles` automaticamente al registrarse
- `generar_codigo_referido()` -> codigo unico de 8 caracteres por usuario
- `abrir_disputa(p_solicitud_id, p_motivo, p_descripcion)` -> RPC para clientes
- `resolver_disputa(p_disputa_id, p_decision, p_resolucion)` -> RPC admin
- `liberar_fondos_custodia(p_pago_id)` -> mueve dinero a `saldo_tecnicos` y registra comision

---

## Estructura del proyecto

```
src/
├── components/
│   ├── chat/              # Componentes del chat
│   ├── mapa/              # Mapa y leaflet
│   ├── publicidad/        # Banners publicitarios
│   ├── reportes/          # Tablas y graficos
│   ├── routing/           # ProtectedRoute, RoleRoute
│   ├── solicitudes/       # Cards (TarjetaSolicitud incluye disputa + NPS)
│   └── tecnico/           # Perfil y cards de tecnico
├── context/               # AuthContext (con codigoRef en signUp)
├── hooks/                 # Custom hooks
├── layouts/               # AdminLayout, TecnicoLayout, ClienteLayout
├── lib/                   # Supabase client, rutas, storage, helpers
├── pages/
│   ├── admin/             # Dashboard, Disputas, Verificaciones, ...
│   ├── auth/              # LoginPage, RegisterPage (con referido + terminos)
│   ├── cliente/
│   ├── tecnico/
│   ├── Terminos.tsx       # T&C publicos
│   └── Privacidad.tsx     # Politica de privacidad (Ley 29733 PE)
└── types/                 # Tipos TypeScript (database.ts generado)
supabase/
├── migrations/
│   ├── 0001_init.sql
│   ├── 0002_chat.sql
│   ├── 0003_publicidad.sql
│   ├── 0004_suscripciones.sql
│   ├── 0005_seguridad.sql
│   ├── 0006_escrow_yape_plin.sql
│   ├── 0007_cotizaciones_diagnostico.sql
│   ├── 0008_verificacion_identidad.sql
│   └── 0009_disputas_nps_referidos.sql
└── seed.sql               # Datos iniciales (idempotente)
```

---

## Setup inicial

### 1. Variables de entorno

Crear `.env.local`:

```bash
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Aplicar migraciones (Supabase Management API)

```bash
TOKEN="<tu-supabase-access-token>"
PROJECT_ID="<tu-project-id>"

for f in supabase/migrations/*.sql; do
  echo "Aplicando $f..."
  curl -s -X POST \
    "https://api.supabase.com/v1/projects/$PROJECT_ID/database/query" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    --data "$(jq -Rs '{query: .}' < "$f")"
done
```

### 4. Cargar datos de prueba

```bash
curl -s -X POST \
  "https://api.supabase.com/v1/projects/$PROJECT_ID/database/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data "$(jq -Rs '{query: .}' < supabase/seed.sql)"
```

### 5. Levantar la app

```bash
npm run dev
```

---

## Usuarios de prueba

**Password para todos:** `Test1234!`

### Admin

| Email | Rol |
|-------|-----|
| `admin@chambaya.pe` | admin |

### Tecnicos (verificados)

| Email | Especialidad |
|-------|--------------|
| `carlos.gasfitero@chambaya.pe` | Gasfiteria / Plomeria |
| `luis.electricista@chambaya.pe` | Electricidad |
| `pedro.albanil@chambaya.pe` | Albanileria |
| `jose.carpintero@chambaya.pe` | Carpinteria |
| `miguel.pintor@chambaya.pe` | Pintura |
| `roberto.cerrajero@chambaya.pe` | Cerrajeria |

### Clientes

| Email | Notas |
|-------|-------|
| `maria.cliente@chambaya.pe` | Cliente con historial |
| `ana.cliente@chambaya.pe` | Cliente nuevo |
| `juan.cliente@chambaya.pe` | Cliente con disputa previa |

---

## Casos de prueba sugeridos

### Como cliente
1. Registrarse con codigo de referido valido
2. Buscar tecnico por categoria + distancia
3. Crear solicitud, aprobar cotizacion, subir voucher Yape
4. Liberar fondos + dejar resena + NPS
5. Abrir disputa en una solicitud `en_proceso`

### Como tecnico
1. Completar perfil + subir DNI/selfie
2. Aceptar solicitud y enviar cotizacion
3. Marcar trabajo completado
4. Revisar saldo despues de liberacion (90% del monto)

### Como admin
1. Aprobar verificacion de identidad pendiente
2. Resolver disputa a favor del cliente (genera reembolso)
3. Resolver disputa a favor del tecnico (libera fondos)
4. Revisar reporte de ingresos por comision

---

## Diferenciadores vs competencia

| Feature | ChambaYA | Apps tradicionales |
|---------|----------|--------------------|
| Pago Yape/Plin nativo | Si | Tarjeta solamente |
| Escrow / fondos en custodia | Si | No (pago directo) |
| Cotizacion previa | Si | No |
| Verificacion DNI | Si | A veces |
| Sistema de disputas | Si | Soporte por correo |
| NPS separado de resena | Si | Solo estrellas |
| Foco local (Ayacucho) | Si | Solo Lima |
| Comision baja (10%) | Si | 15-25% tipico |

---

## Scripts npm

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de produccion
npm run lint       # Linter
npm run preview    # Preview del build
```
