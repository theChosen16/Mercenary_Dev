# ⚙️ Especificaciones Técnicas - Plataforma Web Mercenary

**Proyecto:** Mercenary Web Platform  
**Fecha:** 28 de Julio, 2025  
**Versión:** 1.0.0  
**Documento:** Especificaciones Técnicas Detalladas  

---

## 🎯 Requerimientos Funcionales

### Core Features (MVP)

#### 1. Sistema de Autenticación
```typescript
interface AuthenticationSystem {
  // Registro de usuarios
  register(userData: RegisterData): Promise<AuthResponse>
  
  // Inicio de sesión
  login(credentials: LoginCredentials): Promise<AuthResponse>
  
  // Recuperación de contraseña
  resetPassword(email: string): Promise<void>
  
  // Verificación de email
  verifyEmail(token: string): Promise<void>
  
  // Autenticación social (opcional)
  socialLogin(provider: 'google' | 'linkedin'): Promise<AuthResponse>
}

interface RegisterData {
  email: string
  password: string
  userType: 'freelancer' | 'client'
  firstName: string
  lastName: string
  phone?: string
}
```

#### 2. Dashboard de Usuario
```typescript
interface UserDashboard {
  // Dashboard Freelancer
  freelancerDashboard: {
    profile: FreelancerProfile
    activeProjects: Project[]
    earnings: EarningsData
    ranking: RankingInfo
    notifications: Notification[]
  }
  
  // Dashboard Cliente
  clientDashboard: {
    profile: ClientProfile
    postedProjects: Project[]
    activeHires: Project[]
    expenses: ExpenseData
    notifications: Notification[]
  }
}

interface FreelancerProfile {
  id: string
  personalInfo: PersonalInfo
  skills: Skill[]
  portfolio: PortfolioItem[]
  reviews: Review[]
  rankingPoints: number
  completedProjects: number
  successRate: number
}
```

#### 3. Sistema de Proyectos
```typescript
interface ProjectSystem {
  // Gestión de proyectos
  createProject(data: ProjectCreateData): Promise<Project>
  updateProject(id: string, data: ProjectUpdateData): Promise<Project>
  deleteProject(id: string): Promise<void>
  
  // Búsqueda y filtrado
  searchProjects(filters: ProjectFilters): Promise<Project[]>
  getProjectsByCategory(category: string): Promise<Project[]>
  
  // Sistema de ofertas
  submitProposal(projectId: string, proposal: Proposal): Promise<void>
  acceptProposal(proposalId: string): Promise<void>
  rejectProposal(proposalId: string): Promise<void>
}

interface Project {
  id: string
  title: string
  description: string
  category: ProjectCategory
  budget: BudgetRange
  deadline: Date
  skills: string[]
  client: ClientInfo
  status: ProjectStatus
  proposals: Proposal[]
  attachments: FileAttachment[]
}
```

#### 4. Sistema de Chat
```typescript
interface ChatSystem {
  // Gestión de conversaciones
  createConversation(participants: string[]): Promise<Conversation>
  getConversations(userId: string): Promise<Conversation[]>
  
  // Mensajería
  sendMessage(conversationId: string, message: MessageData): Promise<Message>
  markAsRead(conversationId: string): Promise<void>
  
  // Archivos y multimedia
  uploadFile(file: File): Promise<FileAttachment>
  sendFileMessage(conversationId: string, file: FileAttachment): Promise<Message>
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: 'text' | 'file' | 'system'
  timestamp: Date
  readBy: string[]
  attachments?: FileAttachment[]
}
```

#### 5. Sistema de Pagos y Escrow
```typescript
interface PaymentSystem {
  // Gestión de escrow
  createEscrow(projectId: string, amount: number): Promise<EscrowTransaction>
  releasePayment(escrowId: string): Promise<void>
  requestRefund(escrowId: string, reason: string): Promise<void>
  
  // Historial de transacciones
  getTransactionHistory(userId: string): Promise<Transaction[]>
  generateInvoice(transactionId: string): Promise<Invoice>
  
  // Métodos de pago
  addPaymentMethod(paymentData: PaymentMethodData): Promise<PaymentMethod>
  removePaymentMethod(methodId: string): Promise<void>
}

interface EscrowTransaction {
  id: string
  projectId: string
  clientId: string
  freelancerId: string
  amount: number
  currency: 'CLP' | 'USD'
  status: 'pending' | 'held' | 'released' | 'refunded'
  createdAt: Date
  releasedAt?: Date
}
```

#### 6. Sistema de Gamificación
```typescript
interface GamificationSystem {
  // Puntos y ranking
  getUserRanking(userId: string): Promise<RankingInfo>
  getLeaderboard(category?: string): Promise<LeaderboardEntry[]>
  
  // Logros y badges
  getUserAchievements(userId: string): Promise<Achievement[]>
  unlockAchievement(userId: string, achievementId: string): Promise<void>
  
  // Sistema de niveles
  calculateLevel(points: number): UserLevel
  getNextLevelRequirements(currentLevel: number): LevelRequirements
}

interface RankingInfo {
  userId: string
  totalPoints: number
  level: UserLevel
  rank: number
  category: string
  badges: Badge[]
  achievements: Achievement[]
}
```

---

## 🏗️ Arquitectura de Componentes

### Component Hierarchy

#### 1. Layout Components
```typescript
// Root Layout
interface RootLayoutProps {
  children: React.ReactNode
  user?: User
}

// Dashboard Layout
interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  header: React.ReactNode
  user: User
}

// Auth Layout
interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}
```

#### 2. Feature Components
```typescript
// Project Components
interface ProjectCardProps {
  project: Project
  onApply?: (projectId: string) => void
  onEdit?: (projectId: string) => void
  showActions?: boolean
}

interface ProjectFormProps {
  initialData?: Partial<Project>
  onSubmit: (data: ProjectCreateData) => void
  onCancel: () => void
  isLoading?: boolean
}

// Chat Components
interface ChatWindowProps {
  conversation: Conversation
  currentUser: User
  onSendMessage: (message: string) => void
  onUploadFile: (file: File) => void
}

interface MessageListProps {
  messages: Message[]
  currentUser: User
  onLoadMore?: () => void
  isLoading?: boolean
}
```

#### 3. UI Components (Design System)
```typescript
// Button Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
}

// Form Components
interface InputProps {
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number'
  error?: string
  required?: boolean
  disabled?: boolean
  value: string
  onChange: (value: string) => void
}

interface SelectProps {
  label: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  required?: boolean
}
```

---

## 🔄 State Management Architecture

### Zustand Store Structure

#### 1. Authentication Store
```typescript
interface AuthStore {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
  updateProfile: (data: ProfileUpdateData) => Promise<void>
  clearError: () => void
}

const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authAPI.login(credentials)
      set({ user: response.user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  logout: () => {
    authAPI.logout()
    set({ user: null, isAuthenticated: false })
  }
}))
```

#### 2. Projects Store
```typescript
interface ProjectsStore {
  // State
  projects: Project[]
  currentProject: Project | null
  filters: ProjectFilters
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchProjects: (filters?: ProjectFilters) => Promise<void>
  createProject: (data: ProjectCreateData) => Promise<void>
  updateProject: (id: string, data: ProjectUpdateData) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setFilters: (filters: ProjectFilters) => void
  setCurrentProject: (project: Project | null) => void
}
```

#### 3. Chat Store
```typescript
interface ChatStore {
  // State
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Record<string, Message[]>
  isConnected: boolean
  
  // Actions
  fetchConversations: () => Promise<void>
  setActiveConversation: (conversation: Conversation) => void
  sendMessage: (conversationId: string, content: string) => Promise<void>
  receiveMessage: (message: Message) => void
  markAsRead: (conversationId: string) => void
}
```

---

## 🌐 API Integration Specifications

### API Client Configuration
```typescript
// API Client Setup
class MercenaryAPIClient {
  private baseURL: string
  private authToken: string | null = null
  
  constructor(baseURL: string) {
    this.baseURL = baseURL
  }
  
  setAuthToken(token: string) {
    this.authToken = token
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers,
    }
    
    const response = await fetch(url, { ...options, headers })
    
    if (!response.ok) {
      throw new APIError(response.status, await response.text())
    }
    
    return response.json()
  }
}
```

### API Endpoints Mapping
```typescript
// Authentication Endpoints
const authEndpoints = {
  login: 'POST /auth/login',
  register: 'POST /auth/register',
  refresh: 'POST /auth/refresh',
  logout: 'POST /auth/logout',
  resetPassword: 'POST /auth/reset-password',
  verifyEmail: 'POST /auth/verify-email'
}

// User Endpoints
const userEndpoints = {
  getProfile: 'GET /users/profile',
  updateProfile: 'PUT /users/profile',
  uploadAvatar: 'POST /users/avatar',
  getFreelancerProfile: 'GET /users/freelancer/:id',
  updateFreelancerProfile: 'PUT /users/freelancer'
}

// Project Endpoints
const projectEndpoints = {
  getProjects: 'GET /projects',
  createProject: 'POST /projects',
  getProject: 'GET /projects/:id',
  updateProject: 'PUT /projects/:id',
  deleteProject: 'DELETE /projects/:id',
  submitProposal: 'POST /projects/:id/proposals',
  getProposals: 'GET /projects/:id/proposals'
}
```

---

## 🎨 UI/UX Specifications

### Design System Tokens
```typescript
// Color Palette
const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    900: '#1e3a8a'
  },
  secondary: {
    50: '#fefce8',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    900: '#78350f'
  },
  success: {
    50: '#ecfdf5',
    500: '#10b981',
    600: '#059669'
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626'
  }
}

// Typography Scale
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace']
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem'
  }
}

// Spacing Scale
const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  4: '1rem',
  8: '2rem',
  16: '4rem'
}
```

### Component Variants
```typescript
// Button Variants
const buttonVariants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-700',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
  ghost: 'text-primary-600 hover:bg-primary-50'
}

// Card Variants
const cardVariants = {
  default: 'bg-white border border-gray-200 rounded-lg shadow-sm',
  elevated: 'bg-white rounded-lg shadow-lg',
  outlined: 'bg-white border-2 border-gray-200 rounded-lg'
}
```

### Responsive Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
}

// Usage in components
const responsiveClasses = {
  container: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  text: 'text-sm sm:text-base lg:text-lg'
}
```

---

## 🔒 Security Specifications

### Authentication & Authorization
```typescript
// JWT Token Structure
interface JWTPayload {
  sub: string        // User ID
  email: string      // User email
  role: UserRole     // User role
  permissions: Permission[]
  iat: number        // Issued at
  exp: number        // Expires at
}

// Route Protection
interface RouteProtection {
  requireAuth: boolean
  requiredRole?: UserRole
  requiredPermissions?: Permission[]
  redirectTo?: string
}

// Example protected route
const protectedRoutes: Record<string, RouteProtection> = {
  '/dashboard': { requireAuth: true },
  '/admin': { requireAuth: true, requiredRole: UserRole.ADMIN },
  '/projects/create': { 
    requireAuth: true, 
    requiredPermissions: [Permission.CREATE_PROJECTS] 
  }
}
```

### Input Validation Schemas
```typescript
// Zod validation schemas
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener mayúscula, minúscula y número'),
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  userType: z.enum(['freelancer', 'client']),
  phone: z.string().optional()
})

const projectSchema = z.object({
  title: z.string().min(10, 'Mínimo 10 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().min(50, 'Mínimo 50 caracteres'),
  budget: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    currency: z.enum(['CLP', 'USD'])
  }),
  deadline: z.date().min(new Date(), 'La fecha debe ser futura'),
  skills: z.array(z.string()).min(1, 'Selecciona al menos una habilidad')
})
```

---

## 📊 Performance Specifications

### Performance Targets
```typescript
interface PerformanceTargets {
  // Core Web Vitals
  LCP: number        // < 2.5s (Largest Contentful Paint)
  FID: number        // < 100ms (First Input Delay)
  CLS: number        // < 0.1 (Cumulative Layout Shift)
  
  // Additional Metrics
  FCP: number        // < 1.8s (First Contentful Paint)
  TTI: number        // < 3.8s (Time to Interactive)
  TBT: number        // < 200ms (Total Blocking Time)
  
  // Bundle Metrics
  initialBundleSize: number    // < 250KB gzipped
  routeBundleSize: number      // < 100KB gzipped per route
}
```

### Optimization Strategies
```typescript
// Code Splitting Configuration
const optimizationConfig = {
  // Route-based splitting
  routes: 'automatic',
  
  // Component-based splitting
  components: {
    threshold: '50KB',
    strategy: 'lazy-loading'
  },
  
  // Vendor splitting
  vendors: {
    react: 'separate-chunk',
    ui: 'separate-chunk',
    utils: 'inline'
  },
  
  // Image optimization
  images: {
    formats: ['webp', 'avif'],
    sizes: [640, 768, 1024, 1280, 1920],
    quality: 85
  }
}
```

---

## 🧪 Testing Specifications

### Testing Strategy
```typescript
// Unit Testing (Vitest + Testing Library)
interface ComponentTest {
  render: () => RenderResult
  userInteractions: UserEvent[]
  assertions: Assertion[]
  mockData: MockData
}

// Integration Testing
interface APITest {
  endpoint: string
  method: HTTPMethod
  payload?: unknown
  expectedResponse: ExpectedResponse
  errorCases: ErrorCase[]
}

// E2E Testing (Playwright)
interface E2ETest {
  scenario: string
  steps: TestStep[]
  assertions: PageAssertion[]
  cleanup: CleanupStep[]
}
```

### Test Coverage Targets
```typescript
const coverageTargets = {
  statements: 90,
  branches: 85,
  functions: 90,
  lines: 90,
  
  // Critical paths
  authentication: 95,
  payments: 98,
  dataValidation: 95
}
```

---

## 🚀 Deployment Specifications

### Build Configuration
```typescript
// Next.js Build Config
const nextConfig = {
  // Performance optimizations
  experimental: {
    turbo: true,
    optimizeCss: true,
    swcMinify: true
  },
  
  // Bundle analysis
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true'
  },
  
  // Image optimization
  images: {
    domains: ['cdn.mercenary.cl', 'storage.googleapis.com'],
    formats: ['image/webp', 'image/avif']
  },
  
  // Security headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: securityHeaders
    }
  ]
}
```

### Environment Configuration
```typescript
// Environment Variables
interface EnvironmentConfig {
  // API Configuration
  NEXT_PUBLIC_API_URL: string
  NEXT_PUBLIC_WS_URL: string
  
  // Authentication
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL: string
  
  // Third-party Services
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  
  // Analytics
  NEXT_PUBLIC_GA_ID: string
  SENTRY_DSN: string
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_CHAT: boolean
  NEXT_PUBLIC_ENABLE_PAYMENTS: boolean
}
```

---

Esta especificación técnica proporciona una base sólida para la implementación de la plataforma web Mercenary, asegurando escalabilidad, mantenibilidad y una excelente experiencia de usuario.
