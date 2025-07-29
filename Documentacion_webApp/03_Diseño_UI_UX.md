# 🎨 Diseño UI/UX - Plataforma Web Mercenary

**Proyecto:** Mercenary Web Platform  
**Fecha:** 28 de Julio, 2025  
**Versión:** 1.0.0  
**Documento:** Especificaciones de Diseño e Interfaz de Usuario  

---

## 🎯 Filosofía de Diseño

### Principios Fundamentales
1. **Gamificación Elegante:** Elementos de juego integrados naturalmente
2. **Profesionalismo:** Apariencia seria y confiable para el mercado B2B
3. **Simplicidad Funcional:** Interfaces intuitivas que no sacrifican funcionalidad
4. **Consistencia Visual:** Sistema de diseño coherente en toda la plataforma
5. **Accesibilidad:** Cumplimiento con estándares WCAG 2.1 AA

### Personalidad de Marca
- **Confiable:** Colores sólidos, tipografía clara
- **Innovador:** Elementos modernos, animaciones sutiles
- **Profesional:** Layout limpio, jerarquía visual clara
- **Gamificado:** Elementos lúdicos sin comprometer la seriedad

---

## 🎨 Sistema de Diseño

### Paleta de Colores

#### Colores Primarios
```css
/* Azul Mercenary - Color principal */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Color base */
--primary-600: #2563eb;  /* Hover states */
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;

/* Dorado Mercenary - Color de gamificación */
--gold-50: #fffbeb;
--gold-100: #fef3c7;
--gold-200: #fde68a;
--gold-300: #fcd34d;
--gold-400: #fbbf24;
--gold-500: #f59e0b;     /* Color base */
--gold-600: #d97706;     /* Hover states */
--gold-700: #b45309;
--gold-800: #92400e;
--gold-900: #78350f;
```

#### Colores Semánticos
```css
/* Success - Verde */
--success-50: #ecfdf5;
--success-500: #10b981;
--success-600: #059669;

/* Warning - Amarillo */
--warning-50: #fffbeb;
--warning-500: #f59e0b;
--warning-600: #d97706;

/* Error - Rojo */
--error-50: #fef2f2;
--error-500: #ef4444;
--error-600: #dc2626;

/* Info - Azul claro */
--info-50: #f0f9ff;
--info-500: #0ea5e9;
--info-600: #0284c7;
```

#### Colores Neutros
```css
/* Grises para texto y backgrounds */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### Tipografía

#### Fuentes
```css
/* Fuente principal - Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

/* Fuente monospace para código */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

#### Escala Tipográfica
```css
/* Tamaños de texto */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */

/* Pesos de fuente */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;
```

### Espaciado y Layout

#### Sistema de Espaciado (8px grid)
```css
--space-0: 0;
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

#### Breakpoints Responsivos
```css
--breakpoint-sm: 640px;    /* Mobile landscape */
--breakpoint-md: 768px;    /* Tablet */
--breakpoint-lg: 1024px;   /* Desktop */
--breakpoint-xl: 1280px;   /* Large desktop */
--breakpoint-2xl: 1536px;  /* Extra large */
```

### Sombras y Elevación
```css
/* Sistema de sombras */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Sombras de gamificación */
--shadow-gold: 0 4px 14px 0 rgba(245, 158, 11, 0.25);
--shadow-success: 0 4px 14px 0 rgba(16, 185, 129, 0.25);
```

### Bordes y Radios
```css
/* Radios de borde */
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-3xl: 1.5rem;     /* 24px */
--radius-full: 9999px;    /* Circular */

/* Anchos de borde */
--border-0: 0;
--border-1: 1px;
--border-2: 2px;
--border-4: 4px;
```

---

## 🖼️ Wireframes y Layouts

### 1. Layout Principal (Dashboard)

#### Desktop Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header (Navigation + User Menu)                            │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────────┐ │
│ │             │ │                                         │ │
│ │   Sidebar   │ │          Main Content Area              │ │
│ │             │ │                                         │ │
│ │ - Dashboard │ │  ┌─────────────────────────────────────┐ │ │
│ │ - Projects  │ │  │                                     │ │ │
│ │ - Messages  │ │  │         Page Content                │ │ │
│ │ - Profile   │ │  │                                     │ │ │
│ │ - Settings  │ │  │                                     │ │ │
│ │             │ │  └─────────────────────────────────────┘ │ │
│ │             │ │                                         │ │
│ └─────────────┘ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Mobile Layout
```
┌─────────────────────────┐
│ Header + Hamburger Menu │
├─────────────────────────┤
│                         │
│                         │
│     Main Content        │
│     (Full Width)        │
│                         │
│                         │
├─────────────────────────┤
│   Bottom Navigation     │
│  [Home][Projects][Chat] │
└─────────────────────────┘
```

### 2. Componentes de Navegación

#### Header Component
```typescript
interface HeaderProps {
  user: User
  notifications: Notification[]
  onMenuToggle: () => void
}

// Visual Structure:
// [Logo] [Search Bar] [Notifications] [User Menu]
```

#### Sidebar Component
```typescript
interface SidebarProps {
  currentPath: string
  userType: 'freelancer' | 'client'
  isCollapsed: boolean
}

// Navigation Items:
// Freelancer: Dashboard, Find Projects, My Proposals, Messages, Profile, Earnings
// Client: Dashboard, Post Project, My Projects, Messages, Profile, Billing
```

### 3. Dashboard Layouts

#### Freelancer Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Welcome Back, [Name] | Level [X] Freelancer                │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│ │   Active    │ │  Earnings   │ │   Rating    │ │  Rank   │ │
│ │  Projects   │ │  This Month │ │   Average   │ │ Position│ │
│ │     [3]     │ │  $2,450     │ │    4.8★     │ │  #127   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┐ ┌─────────────────────────┐ │
│ │     Recent Projects         │ │    Recommended Jobs     │ │
│ │                             │ │                         │ │
│ │ • Project A - In Progress   │ │ • React Developer       │ │
│ │ • Project B - Review        │ │ • UI/UX Designer        │ │
│ │ • Project C - Completed     │ │ • Mobile App Dev        │ │
│ └─────────────────────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Client Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Welcome Back, [Company Name]                               │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│ │   Active    │ │   Total     │ │  Completed  │ │  Saved  │ │
│ │  Projects   │ │   Spent     │ │  Projects   │ │ Talents │ │
│ │     [5]     │ │  $12,340    │ │     [23]    │ │   [8]   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────┐ ┌─────────────────────────┐ │
│ │     Active Projects         │ │    Quick Actions        │ │
│ │                             │ │                         │ │
│ │ • Website Redesign          │ │ [+ Post New Project]    │ │
│ │ • Mobile App Development    │ │ [📊 View Analytics]     │ │
│ │ • Logo Design              │ │ [💬 Messages (3)]       │ │
│ └─────────────────────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎮 Elementos de Gamificación

### Sistema de Niveles y Badges

#### Visualización de Nivel
```typescript
interface LevelDisplay {
  currentLevel: number
  currentXP: number
  nextLevelXP: number
  levelName: string
  levelColor: string
}

// Visual: Progress bar with level indicator
// [Novice] ████████░░ 80% → [Expert]
```

#### Badges y Logros
```typescript
interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: Date
}

// Visual Examples:
// 🥇 "First Project" - Complete your first project
// ⭐ "5-Star Rating" - Receive a 5-star review
// 🔥 "Hot Streak" - Complete 5 projects in a row
// 💎 "Elite Freelancer" - Reach top 1% ranking
```

#### Ranking System
```typescript
interface RankingDisplay {
  globalRank: number
  categoryRank: number
  percentile: number
  trend: 'up' | 'down' | 'stable'
  pointsToNextRank: number
}

// Visual: Leaderboard with user position highlighted
```

### Elementos Visuales de Gamificación

#### Colores por Rareza
```css
/* Badge rarity colors */
--rarity-common: #6b7280;     /* Gray */
--rarity-rare: #3b82f6;       /* Blue */
--rarity-epic: #8b5cf6;       /* Purple */
--rarity-legendary: #f59e0b;   /* Gold */
```

#### Animaciones de Logros
```css
/* Achievement unlock animation */
@keyframes achievementUnlock {
  0% { transform: scale(0) rotate(180deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(0deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* Level up animation */
@keyframes levelUp {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}
```

---

## 📱 Componentes UI Específicos

### 1. Project Card Component

#### Diseño Visual
```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────┐ Website Redesign for E-commerce        💰 $2,500   │
│ │ 🏢  │ Posted by: TechCorp                    ⏰ 2 days   │
│ └─────┘                                                     │
│                                                             │
│ We need a modern, responsive website redesign for our...    │
│                                                             │
│ 🏷️ React  JavaScript  UI/UX  Responsive                    │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│ │   💡 Apply  │ │  💾 Save    │ │  👁️ 23 views • 5 bids   │ │
│ └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Component Props
```typescript
interface ProjectCardProps {
  project: Project
  showActions?: boolean
  onApply?: (projectId: string) => void
  onSave?: (projectId: string) => void
  onView?: (projectId: string) => void
  variant?: 'default' | 'compact' | 'featured'
}
```

### 2. User Profile Card

#### Freelancer Profile
```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────┐  María González                    ⭐ 4.9 (127) │
│ │ 👤      │  Senior React Developer            🏆 Level 15  │
│ │ Avatar  │  📍 Santiago, Chile                💎 Top 5%   │
│ └─────────┘                                                 │
│                                                             │
│ Especialista en React con 5+ años de experiencia...        │
│                                                             │
│ 💼 $45/hour  •  ✅ Available  •  🕐 Usually responds in 2h │
│                                                             │
│ 🛠️ React  TypeScript  Node.js  PostgreSQL                  │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│ │ 💬 Message  │ │ 📋 Hire     │ │ 💾 Save to Favorites    │ │
│ └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3. Chat Interface

#### Chat Window Design
```
┌─────────────────────────────────────────────────────────────┐
│ 👤 María González • Online                          ⚙️ 📞  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Hola! Vi tu proyecto de React...            María  14:30  │
│                                              ┌─────────────┐│
│                                              │ Me interesa │││
│                                              │ participar  │││
│                                              └─────────────┘│
│                                                             │
│ ┌─────────────────────────────┐                            │
│ │ Perfecto! Cuéntame más      │               Tú    14:32  │
│ │ sobre tu experiencia        │                            │
│ └─────────────────────────────┘                            │
│                                                             │
│  Tengo 5 años trabajando con React...       María  14:33  │
│  📎 portfolio.pdf                                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 💬 Type a message...                          📎 😊 📤     │
└─────────────────────────────────────────────────────────────┘
```

### 4. Notification System

#### Toast Notifications
```typescript
interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: NotificationAction[]
}

// Visual Examples:
// ✅ Success: "Project proposal submitted successfully!"
// ❌ Error: "Failed to upload file. Please try again."
// ⚠️ Warning: "Your subscription expires in 3 days."
// ℹ️ Info: "New message from María González"
```

#### In-App Notifications
```
┌─────────────────────────────────────────────────────────────┐
│ 🔔 Notifications (3)                                       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 💬 New message from TechCorp                     2m ago │ │
│ │ "Thanks for your proposal. When can you start?"        │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎉 Achievement unlocked: "Fast Responder"       1h ago │ │
│ │ You earned 50 XP for quick response times!             │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 💰 Payment received: $1,250                     3h ago │ │
│ │ Project "Logo Design" payment has been released        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Estados de Interfaz

### Loading States

#### Skeleton Loading
```css
/* Skeleton animation */
@keyframes skeleton-loading {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s infinite;
}
```

#### Spinner Components
```typescript
interface SpinnerProps {
  size: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

// Visual: Rotating circle with Mercenary colors
```

### Empty States

#### No Projects Found
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        🔍                                   │
│                                                             │
│                 No projects found                           │
│                                                             │
│          Try adjusting your search filters or              │
│               check back later for new projects            │
│                                                             │
│              ┌─────────────────────────────┐                │
│              │     🔄 Refresh Projects     │                │
│              └─────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Error States

#### Network Error
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        ⚠️                                   │
│                                                             │
│              Connection Error                               │
│                                                             │
│         Unable to connect to Mercenary servers.            │
│              Please check your internet connection         │
│                                                             │
│              ┌─────────────────────────────┐                │
│              │        🔄 Try Again         │                │
│              └─────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 Responsive Design Guidelines

### Mobile-First Approach

#### Breakpoint Strategy
```css
/* Mobile First (320px+) */
.container {
  padding: 1rem;
  max-width: 100%;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    max-width: 768px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

#### Component Adaptations
```typescript
// Navigation: Hamburger menu on mobile, full nav on desktop
// Cards: Single column on mobile, grid on desktop
// Forms: Stacked on mobile, side-by-side on desktop
// Chat: Full screen on mobile, sidebar on desktop
```

### Touch-Friendly Design

#### Interactive Elements
```css
/* Minimum touch target size */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* Hover states only on non-touch devices */
@media (hover: hover) {
  .button:hover {
    background-color: var(--primary-600);
  }
}
```

---

## ♿ Accesibilidad (A11y)

### Estándares de Cumplimiento
- **WCAG 2.1 AA:** Cumplimiento completo
- **Contraste:** Mínimo 4.5:1 para texto normal, 3:1 para texto grande
- **Navegación por teclado:** Todos los elementos interactivos accesibles
- **Screen readers:** Etiquetas ARIA apropiadas

### Implementación
```typescript
// Semantic HTML
<nav aria-label="Main navigation">
<main aria-label="Dashboard content">
<section aria-labelledby="projects-heading">

// ARIA attributes
<button aria-expanded="false" aria-controls="mobile-menu">
<div role="alert" aria-live="polite">
<input aria-describedby="email-error" aria-invalid="true">

// Focus management
const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
```

---

## 🎨 Guía de Implementación

### CSS Architecture (Tailwind + Custom)
```css
/* Custom properties for consistency */
:root {
  --header-height: 64px;
  --sidebar-width: 256px;
  --sidebar-collapsed-width: 64px;
}

/* Component-specific styles */
@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg font-medium;
    @apply hover:bg-primary-700 focus:ring-2 focus:ring-primary-500;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-200;
    @apply hover:shadow-md transition-shadow duration-200;
  }
}
```

### Animation Guidelines
```css
/* Consistent timing functions */
:root {
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}

/* Standard durations */
.transition-fast { transition-duration: 150ms; }
.transition-normal { transition-duration: 300ms; }
.transition-slow { transition-duration: 500ms; }
```

---

Esta documentación de diseño UI/UX proporciona una base sólida para crear una interfaz consistente, accesible y atractiva que refleje la personalidad profesional y gamificada de la plataforma Mercenary.
