# GymFlow — Guía de Configuración Local

## Requisitos Previos

- Node.js 18+
- npm 9+
- PostgreSQL (local o Neon cloud)

---

## 1. Clonar e Instalar

```bash
cd gymflow
npm install
```

---

## 2. Configurar Variables de Entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores reales:

```env
# Base de datos (Neon recomendado para producción)
DATABASE_URL="postgresql://user:password@host/gymflow?sslmode=require"

# Para desarrollo local con PostgreSQL:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/gymflow"

# Genera una clave secreta con:
# openssl rand -base64 32
AUTH_SECRET="tu-clave-secreta-aqui"

AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 3. Base de Datos

### Opción A: Neon (Recomendado para producción)

1. Crea una cuenta en [neon.tech](https://neon.tech)
2. Crea un nuevo proyecto "gymflow"
3. Copia el connection string en `DATABASE_URL`

### Opción B: PostgreSQL Local

```bash
# Crear base de datos
createdb gymflow

# O con psql:
psql -U postgres -c "CREATE DATABASE gymflow;"
```

---

## 4. Crear Tablas (Migración)

```bash
# Opción 1: Push directo (desarrollo rápido)
npm run db:push

# Opción 2: Migraciones versionadas (recomendado para producción)
npm run db:migrate
```

---

## 5. Cargar Datos de Prueba

```bash
npm run db:seed
```

Esto crea:
- 👤 **Usuario admin:** `admin@gymflow.co` / `gymflow123`
- 🏋️ **Gimnasio:** GymFit Manizales
- 📋 **4 planes** de membresía
- 👥 **10 miembros** con membresías variadas
- 💰 **10 pagos** registrados
- 📅 **Asistencia** de los últimos 7 días

---

## 6. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 7. Inspeccionar la Base de Datos

```bash
npm run db:studio
```

Abre Prisma Studio en [http://localhost:5555](http://localhost:5555)

---

## Despliegue en Vercel

1. Conecta el repositorio a Vercel
2. Configura las variables de entorno en el panel de Vercel
3. Asegúrate de tener una base de datos PostgreSQL accesible (Neon recomendado)
4. Ejecuta las migraciones post-deploy:

```bash
# Agrega este comando en build settings de Vercel:
prisma migrate deploy && next build
```

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/          # Login y Registro
│   ├── (app)/           # Páginas protegidas
│   │   ├── dashboard/   # Panel principal
│   │   ├── members/     # Gestión de miembros
│   │   ├── plans/       # Planes de membresía
│   │   ├── memberships/ # Asignación de planes
│   │   ├── payments/    # Registro de pagos
│   │   └── attendance/  # Control de asistencia
│   └── api/             # API REST endpoints
├── components/
│   ├── ui/              # shadcn/ui componentes
│   ├── layout/          # Sidebar, navegación
│   ├── members/         # Componentes de miembros
│   ├── plans/           # Componentes de planes
│   ├── memberships/     # Componentes de membresías
│   └── attendance/      # Componentes de asistencia
├── lib/
│   ├── actions/         # Server Actions (CRUD)
│   ├── utils/           # Utilidades (formato, fechas)
│   └── prisma.ts        # Cliente Prisma singleton
├── auth.ts              # Configuración NextAuth v5
└── proxy.ts             # Middleware de autenticación
prisma/
├── schema.prisma        # Modelos de base de datos
└── seed.ts              # Datos de prueba
```

---

## Credenciales de Prueba

Después del seed:

| Campo | Valor |
|-------|-------|
| Email | admin@gymflow.co |
| Contraseña | gymflow123 |
