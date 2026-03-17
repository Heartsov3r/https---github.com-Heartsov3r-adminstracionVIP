# 🏆 Membresías VIP

Sistema de gestión de membresías construido con Next.js 16, Supabase y Tailwind CSS. Permite a los administradores gestionar clientes, planes, pagos y comprobantes, mientras que los clientes pueden consultar el estado de su membresía en tiempo real.

## 🚀 Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.1.6 (App Router) | Framework principal (SSR + Server Actions) |
| React | 19 | UI |
| Supabase | — | Base de datos PostgreSQL, Auth, Storage |
| Tailwind CSS | v4 | Estilos (glassmorphism + dark mode) |
| Base UI | ^1.2 | Componentes accesibles (Menu, Input, Dialog) |
| date-fns | ^4 | Manejo de fechas |
| Sonner | ^2 | Notificaciones toast |
| Lucide React | — | Iconografía |

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── admin/          # Panel de administración (protegido)
│   │   ├── actions.ts  # Server Actions del dashboard
│   │   ├── layout.tsx  # Sidebar + Header admin
│   │   ├── page.tsx    # Dashboard con métricas
│   │   ├── users/      # Gestión de clientes
│   │   ├── plans/      # Gestión de planes
│   │   ├── payments/   # Gestión de pagos y recibos
│   │   ├── logs/       # Historial de actividad
│   │   ├── profile/    # Perfil del administrador
│   │   └── admins/     # Registro de nuevos admins
│   ├── client/         # Portal del cliente (protegido)
│   │   ├── actions.ts  # Server Actions del cliente
│   │   ├── layout.tsx  # Header cliente
│   │   └── page.tsx    # Estado de membresía + soporte
│   └── login/          # Autenticación
├── components/ui/      # Componentes UI reutilizables
├── lib/supabase/       # Clientes Supabase (server + client)
└── middleware.ts      # Middleware de autenticación y roles
```

## ⚙️ Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto (usa `.env.example` como referencia):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

> ⚠️ **NUNCA subas `.env.local` a GitHub.** El `.gitignore` ya lo excluye.

## 🛠 Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔐 Roles y Acceso

| Rol | Ruta | Descripción |
|---|---|---|
| `admin` | `/admin` | Acceso completo al panel de gestión |
| `client` | `/client` | Portal de consulta de membresía |

El middleware (`proxy.ts`) protege automáticamente las rutas y redirige según el rol registrado en Supabase.

## 🗄️ Base de Datos

El esquema completo de la base de datos está documentado en `schema_db.sql` (en el directorio de artifacts del proyecto). Incluye:

- `profiles` — Usuarios (admin y cliente)
- `plans` — Planes de membresía disponibles
- `memberships` — Suscripciones activas e históricas
- `manual_payments` — Registros de pagos
- `payment_receipts` — Comprobantes de pago almacenados en Supabase Storage

## 📄 Licencia

Proyecto privado — todos los derechos reservados.
