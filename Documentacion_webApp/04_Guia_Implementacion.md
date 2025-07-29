# 🚀 Guía de Implementación - Plataforma Web Mercenary

**Proyecto:** Mercenary Web Platform  
**Fecha:** 28 de Julio, 2025  
**Versión:** 1.0.0  
**Documento:** Guía Completa de Implementación  

---

## 🎯 Plan de Implementación por Fases

### Fase 2.1: Configuración Base (Semana 1)
**Duración:** 5-7 días  
**Objetivo:** Establecer la base técnica del proyecto

#### Setup del Proyecto
```bash
# 1. Crear proyecto Next.js con TypeScript
npx create-next-app@latest mercenary-web-platform --typescript --tailwind --eslint --app --src-dir

# 2. Instalar dependencias principales
npm install zustand @tanstack/react-query framer-motion lucide-react
npm install react-hook-form @hookform/resolvers zod next-auth axios

# 3. Instalar dependencias de desarrollo
npm install -D @types/node @typescript-eslint/eslint-plugin prettier
npm install -D @tailwindcss/forms vitest @testing-library/react
```

#### Estructura de Carpetas
```
src/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/dashboard/
│   ├── api/auth/
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   ├── layout/
│   └── features/
├── hooks/
├── lib/
├── stores/
├── types/
└── utils/
```

### Fase 2.2: Componentes Base (Semana 2)
**Objetivo:** Crear sistema de componentes reutilizables

#### Componentes UI Esenciales
- Button, Input, Select, Textarea
- Card, Modal, Dropdown
- Loading states, Error boundaries
- Toast notifications

#### Layout Components
- Header con navegación y búsqueda
- Sidebar responsivo
- Dashboard layouts
- Mobile navigation

### Fase 2.3: Funcionalidades Core (Semana 3)
**Objetivo:** Implementar funcionalidades principales

#### Sistema de Autenticación
- Login/Register con NextAuth.js
- Protección de rutas
- Gestión de sesiones
- Recuperación de contraseña

#### Dashboard Implementation
- Dashboard freelancer/cliente
- Navegación entre secciones
- Estado global con Zustand
- Integración con API backend

### Fase 2.4: Funcionalidades Avanzadas (Semana 4)
**Objetivo:** Chat, pagos y gamificación

#### Features Avanzadas
- Sistema de chat en tiempo real
- Gamificación (niveles, badges)
- Sistema de notificaciones
- Optimización de performance

---

## 🛠️ Configuraciones Técnicas

### Tailwind CSS Config
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
        gold: {
          500: '#f59e0b',
          600: '#d97706'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
```

### NextAuth Configuration
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Implementar autenticación con backend
        const user = await authenticateUser(credentials)
        return user
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    signUp: '/register'
  }
})

export { handler as GET, handler as POST }
```

### Zustand Store Example
```typescript
// src/stores/authStore.ts
import { create } from 'zustand'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
}))
```

---

## 🎨 Componentes Clave

### Button Component
```typescript
// src/components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        {
          'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
          'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
          'border border-gray-300 hover:bg-gray-50': variant === 'outline',
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        }
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
```

### Project Card Component
```typescript
// src/components/features/ProjectCard.tsx
interface ProjectCardProps {
  project: Project
  onApply?: (projectId: string) => void
  showActions?: boolean
}

export default function ProjectCard({ project, onApply, showActions }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg">{project.title}</h3>
        <div className="text-green-600 font-semibold">
          ${project.budget.min} - ${project.budget.max}
        </div>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-3">
        {project.description}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {project.skills.map((skill) => (
          <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
            {skill}
          </span>
        ))}
      </div>
      
      {showActions && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{project.timeAgo}</span>
          <Button onClick={() => onApply?.(project.id)}>
            Apply
          </Button>
        </div>
      )}
    </div>
  )
}
```

---

## 🔧 Scripts y Configuraciones

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

### Variables de Entorno
```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### Deployment (Vercel)
```yaml
# vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

---

## 📊 Testing Strategy

### Unit Testing
```typescript
// src/__tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/ui/Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

---

## 🚀 Deployment y CI/CD

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
```

---

## 📈 Métricas de Éxito

### Performance Targets
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **Bundle Size:** < 250KB gzipped

### Quality Metrics
- **Test Coverage:** > 80%
- **TypeScript Coverage:** 100%
- **Accessibility:** WCAG 2.1 AA
- **SEO Score:** > 90

---

Esta guía proporciona un roadmap claro y detallado para implementar la plataforma web Mercenary de manera eficiente y escalable.
