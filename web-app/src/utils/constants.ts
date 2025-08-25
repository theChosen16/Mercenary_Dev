// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  USERS: {
    LIST: '/users',
    PROFILE: '/users/profile',
    UPDATE: '/users/profile',
  },
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    DETAIL: (id: string) => `/projects/${id}`,
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
  },
  PROPOSALS: {
    LIST: (projectId: string) => `/projects/${projectId}/proposals`,
    CREATE: (projectId: string) => `/projects/${projectId}/proposals`,
    UPDATE: (id: string) => `/proposals/${id}`,
    ACCEPT: (id: string) => `/proposals/${id}/accept`,
    REJECT: (id: string) => `/proposals/${id}/reject`,
  },
  CHAT: {
    ROOMS: '/chat/rooms',
    MESSAGES: (roomId: string) => `/chat/rooms/${roomId}/messages`,
    SEND: (roomId: string) => `/chat/rooms/${roomId}/messages`,
  },
  PAYMENTS: {
    CREATE: '/payments',
    LIST: '/payments',
    DETAIL: (id: string) => `/payments/${id}`,
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
  },
} as const

// App Configuration
export const APP_CONFIG = {
  NAME: 'Mercenarius',
  DESCRIPTION: 'Plataforma de freelancers gamificada',
  VERSION: '1.0.0',
  AUTHOR: 'Mercenary Team',
  CONTACT_EMAIL: 'contact@mercenarius.cl',
  SUPPORT_EMAIL: 'support@mercenarius.cl',
} as const

// User Types
export const USER_TYPES = {
  FREELANCER: 'freelancer',
  CLIENT: 'client',
} as const

// Project Status
export const PROJECT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

// Proposal Status
export const PROPOSAL_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert',
} as const

// Experience Levels
export const EXPERIENCE_LEVELS = {
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
  EXPERT: 'expert',
} as const

// Availability Status
export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  UNAVAILABLE: 'unavailable',
} as const

// Badge Rarities
export const BADGE_RARITIES = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
} as const

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

// Skills Categories
export const SKILL_CATEGORIES = [
  'Desarrollo Web',
  'Desarrollo Móvil',
  'Diseño UI/UX',
  'Marketing Digital',
  'Redacción',
  'Traducción',
  'Fotografía',
  'Video',
  'Consultoría',
  'Administración',
] as const

// Common Skills
export const COMMON_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Python',
  'Django',
  'FastAPI',
  'PostgreSQL',
  'MongoDB',
  'AWS',
  'Docker',
  'Git',
  'Figma',
  'Photoshop',
  'Illustrator',
  'SEO',
  'Google Ads',
  'Facebook Ads',
  'Content Writing',
  'Copywriting',
  'Translation',
  'Photography',
  'Video Editing',
] as const

// Gamification
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000
] as const

export const XP_REWARDS = {
  PROJECT_COMPLETED: 100,
  POSITIVE_REVIEW: 50,
  PROFILE_COMPLETED: 25,
  FIRST_PROPOSAL: 10,
  DAILY_LOGIN: 5,
} as const

// UI Constants
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

// Validation
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PROJECT_TITLE_MAX_LENGTH: 100,
  PROJECT_DESCRIPTION_MAX_LENGTH: 2000,
  PROPOSAL_MESSAGE_MAX_LENGTH: 1000,
  BIO_MAX_LENGTH: 500,
} as const
