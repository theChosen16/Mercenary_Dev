# 🛠️ Setup del Proyecto - Plataforma Web Mercenary

**Proyecto:** Mercenary Web Platform  
**Fecha:** 28 de Julio, 2025  
**Versión:** 1.0.0  
**Documento:** Guía de Configuración Inicial del Proyecto  

---

## 🎯 Prerrequisitos del Sistema

### Herramientas Requeridas
```bash
# Node.js (versión 18 o superior)
node --version  # v18.17.0 o superior
npm --version   # 9.6.7 o superior

# Git para control de versiones
git --version   # 2.40.0 o superior

# Editor recomendado: VS Code con extensiones
# - TypeScript and JavaScript Language Features
# - Tailwind CSS IntelliSense
# - ES7+ React/Redux/React-Native snippets
# - Prettier - Code formatter
# - ESLint
```

### Variables de Entorno Necesarias
```bash
# Backend API (FastAPI existente)
BACKEND_API_URL=http://localhost:8000
BACKEND_WS_URL=ws://localhost:8000/ws

# Base de datos (PostgreSQL existente)
DATABASE_URL=postgresql://username:password@localhost:5432/mercenary_db

# Servicios externos
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 🚀 Comandos de Instalación

### 1. Crear el Proyecto
```bash
# Navegar al directorio del proyecto Mercenary
cd C:\Users\alean\Desktop\Mercenary_dev

# Crear la carpeta para la web app
mkdir mercenary-web-platform
cd mercenary-web-platform

# Inicializar proyecto Next.js con todas las configuraciones
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 2. Instalar Dependencias Principales
```bash
# State Management y Data Fetching
npm install zustand @tanstack/react-query @tanstack/react-query-devtools

# UI y Animaciones
npm install framer-motion lucide-react @headlessui/react

# Formularios y Validación
npm install react-hook-form @hookform/resolvers zod

# Autenticación
npm install next-auth

# HTTP Client
npm install axios

# Utilidades
npm install clsx tailwind-merge date-fns
```

### 3. Instalar Dependencias de Desarrollo
```bash
# TypeScript y Linting
npm install -D @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Formateo de código
npm install -D prettier eslint-config-prettier eslint-plugin-prettier

# Tailwind CSS plugins
npm install -D @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Herramientas adicionales
npm install -D @next/bundle-analyzer cross-env
```

---

## ⚙️ Configuraciones de Archivos

### 1. TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 2. Tailwind CSS Configuration
```javascript
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['JetBrains Mono', ...fontFamily.mono],
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

### 3. ESLint Configuration
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-const": "error",
    "react-hooks/exhaustive-deps": "warn",
    "prefer-const": "error",
    "no-var": "error"
  },
  "ignorePatterns": ["node_modules/", ".next/", "out/"]
}
```

### 4. Prettier Configuration
```json
// .prettierrc
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### 5. Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['localhost', 'cdn.mercenary.cl'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.BACKEND_API_URL}/:path*`,
      },
    ]
  },
}

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

---

## 📁 Estructura Inicial de Carpetas

### Crear Estructura de Directorios
```bash
# Crear estructura de carpetas
mkdir -p src/components/ui
mkdir -p src/components/forms
mkdir -p src/components/layout
mkdir -p src/components/features
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/stores
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/styles
mkdir -p public/images
mkdir -p public/icons
mkdir -p docs
```

### Archivos Base a Crear
```bash
# Crear archivos base
touch src/lib/utils.ts
touch src/lib/api.ts
touch src/lib/auth.ts
touch src/lib/validations.ts
touch src/types/index.ts
touch src/types/api.ts
touch src/types/auth.ts
touch src/utils/constants.ts
touch src/utils/helpers.ts
touch src/styles/globals.css
```

---

## 🔧 Scripts de Package.json

### Actualizar Scripts
```json
// package.json (agregar/modificar scripts)
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "analyze": "cross-env ANALYZE=true npm run build",
    "clean": "rm -rf .next out node_modules/.cache"
  }
}
```

---

## 🌐 Variables de Entorno

### Crear Archivos de Entorno
```bash
# .env.local (desarrollo local)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-jwt-secret-key-here

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Database
DATABASE_URL=postgresql://mercenary_user:password@localhost:5432/mercenary_db

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true
NEXT_PUBLIC_ENABLE_GAMIFICATION=true

# Environment
NODE_ENV=development
```

```bash
# .env.example (template para otros desarrolladores)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 🧪 Configuración de Testing

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Test Setup File
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

---

## 🔒 Configuración de Seguridad

### Content Security Policy
```javascript
// next.config.js (agregar headers de seguridad)
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## 📋 Checklist de Verificación

### ✅ Verificar Instalación
```bash
# 1. Verificar que el proyecto se ejecuta
npm run dev

# 2. Verificar linting
npm run lint

# 3. Verificar formateo
npm run format:check

# 4. Verificar type checking
npm run type-check

# 5. Verificar tests
npm run test

# 6. Verificar build
npm run build
```

### ✅ Verificar Configuraciones
- [ ] TypeScript configurado correctamente
- [ ] Tailwind CSS funcionando
- [ ] ESLint y Prettier configurados
- [ ] Variables de entorno cargadas
- [ ] Estructura de carpetas creada
- [ ] Scripts de package.json funcionando
- [ ] Testing setup funcionando

---

## 🚀 Próximos Pasos

Una vez completado el setup:

1. **Verificar conexión con backend:** Probar llamadas a la API existente
2. **Configurar autenticación:** Integrar con el sistema de auth del backend
3. **Crear componentes base:** Implementar el sistema de diseño
4. **Desarrollar páginas principales:** Login, dashboard, proyectos
5. **Integrar funcionalidades:** Chat, pagos, gamificación

---

## 🆘 Solución de Problemas Comunes

### Error: "Module not found"
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "TypeScript compilation failed"
```bash
# Verificar configuración de TypeScript
npm run type-check
```

### Error: "Tailwind styles not loading"
```bash
# Verificar que globals.css está importado en layout.tsx
# Verificar configuración de tailwind.config.js
```

### Error: "Environment variables not loaded"
```bash
# Verificar que .env.local existe y tiene las variables correctas
# Reiniciar el servidor de desarrollo
```

---

Esta guía de setup proporciona todo lo necesario para configurar correctamente el proyecto de la plataforma web Mercenary con las mejores prácticas y herramientas modernas.
