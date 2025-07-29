// User types
export interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  profile_picture?: string
  user_type: 'freelancer' | 'client'
  is_active: boolean
  created_at: string
  updated_at: string
  profile?: UserProfile
}

export interface UserProfile {
  id: string
  user_id: string
  bio?: string
  location?: string
  phone?: string
  website?: string
  skills: string[]
  experience_level: 'junior' | 'mid' | 'senior' | 'expert'
  hourly_rate?: number
  availability: 'available' | 'busy' | 'unavailable'
  rating: number
  total_jobs: number
  level: number
  experience_points: number
  badges: Badge[]
}

// Project types
export interface Project {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  deadline: string
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
  client_id: string
  freelancer_id?: string
  created_at: string
  updated_at: string
  client: User
  freelancer?: User
  proposals: Proposal[]
  skills_required: string[]
  category: string
  difficulty_level: 'easy' | 'medium' | 'hard' | 'expert'
}

export interface Proposal {
  id: string
  project_id: string
  freelancer_id: string
  message: string
  proposed_budget: number
  proposed_deadline: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  freelancer: User
}

// Chat types
export interface ChatRoom {
  id: string
  project_id: string
  participants: User[]
  last_message?: ChatMessage
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'file' | 'image'
  created_at: string
  sender: User
}

// Gamification types
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earned_at?: string
}

export interface Achievement {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge: Badge
}

// Payment types
export interface Payment {
  id: string
  project_id: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method: string
  created_at: string
  updated_at: string
}

// Notification types
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  created_at: string
  action_url?: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirm_password: string
  username: string
  first_name: string
  last_name: string
  user_type: 'freelancer' | 'client'
}

export interface ProjectForm {
  title: string
  description: string
  budget_min: number
  budget_max: number
  deadline: string
  skills_required: string[]
  category: string
  difficulty_level: 'easy' | 'medium' | 'hard' | 'expert'
}

export interface ProposalForm {
  message: string
  proposed_budget: number
  proposed_deadline: string
}
