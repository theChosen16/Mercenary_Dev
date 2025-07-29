import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ApiResponse, PaginatedResponse, User } from '@/types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.removeAuthToken()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  private removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  // Generic request methods
  async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data)
    return response.data
  }

  async put<T>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data)
    return response.data
  }

  async patch<T>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url)
    return response.data
  }

  // Paginated requests
  async getPaginated<T>(url: string, params?: Record<string, unknown>): Promise<PaginatedResponse<T>> {
    const response: AxiosResponse<PaginatedResponse<T>> = await this.client.get(url, { params })
    return response.data
  }

  // File upload
  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await this.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    })

    if (response.success && response.data.token) {
      this.setAuthToken(response.data.token)
    }

    return response
  }

  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.removeAuthToken()
    }
  }

  async register(userData: {
    email: string
    password: string
    username: string
    first_name: string
    last_name: string
    user_type: 'freelancer' | 'client'
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await this.post<{ token: string; user: User }>('/auth/register', userData)

    if (response.success && response.data.token) {
      this.setAuthToken(response.data.token)
    }

    return response
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get('/auth/me')
  }

  // WebSocket connection
  createWebSocketConnection(path: string): WebSocket | null {
    if (typeof window === 'undefined') return null

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
    const token = this.getAuthToken()
    
    const ws = new WebSocket(`${wsUrl}${path}${token ? `?token=${token}` : ''}`)
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return ws
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient
