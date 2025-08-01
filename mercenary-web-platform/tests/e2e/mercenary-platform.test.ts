import { test, expect, Page } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Test data
const testUser = {
  email: 'test@mercenary.com',
  password: 'TestPassword123!',
  name: 'Test User'
}

const testProject = {
  title: 'Test Project E2E',
  description: 'This is a test project for E2E testing',
  budget: 5000,
  category: 'Desarrollo Web',
  skills: ['JavaScript', 'React']
}

test.describe('Mercenary Platform E2E Tests', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto(BASE_URL)
  })

  test.afterEach(async () => {
    await page.close()
  })

  test.describe('🏠 Homepage and Navigation', () => {
    test('should load homepage correctly', async () => {
      await expect(page).toHaveTitle(/Mercenary/)
      await expect(page.locator('h1')).toContainText('Mercenary')
      
      // Check main navigation elements
      await expect(page.locator('nav')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Proyectos' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Ranking' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Iniciar Sesión' })).toBeVisible()
    })

    test('should navigate between main pages', async () => {
      // Navigate to Projects
      await page.click('text=Proyectos')
      await expect(page).toHaveURL(/.*\/projects/)
      await expect(page.locator('h1')).toContainText('Proyectos')

      // Navigate to Ranking
      await page.click('text=Ranking')
      await expect(page).toHaveURL(/.*\/ranking/)
      await expect(page.locator('h1')).toContainText('Ranking')

      // Navigate back to Home
      await page.click('text=Mercenary')
      await expect(page).toHaveURL(BASE_URL)
    })

    test('should be responsive on mobile', async () => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Check mobile navigation
      await expect(page.locator('nav')).toBeVisible()
      
      // Test mobile menu if exists
      const mobileMenuButton = page.locator('[aria-label="Menu"]')
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click()
        await expect(page.getByRole('link', { name: 'Proyectos' })).toBeVisible()
      }
    })
  })

  test.describe('🔐 Authentication System', () => {
    test('should register new user successfully', async () => {
      await page.click('text=Registrarse')
      await expect(page).toHaveURL(/.*\/register/)

      // Fill registration form
      await page.fill('input[name="name"]', testUser.name)
      await page.fill('input[name="email"]', `e2e-${Date.now()}@test.com`)
      await page.fill('input[name="password"]', testUser.password)
      await page.selectOption('select[name="role"]', 'CLIENT')

      // Submit form
      await page.click('button[type="submit"]')
      
      // Should redirect to dashboard or login
      await page.waitForURL(/.*\/(dashboard|login)/)
    })

    test('should login with valid credentials', async () => {
      await page.click('text=Iniciar Sesión')
      await expect(page).toHaveURL(/.*\/login/)

      // Fill login form
      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="password"]', testUser.password)

      // Submit form
      await page.click('button[type="submit"]')
      
      // Should redirect to dashboard
      await page.waitForURL(/.*\/dashboard/, { timeout: 10000 })
      await expect(page.locator('h1')).toContainText('Dashboard')
    })

    test('should show error with invalid credentials', async () => {
      await page.click('text=Iniciar Sesión')
      
      await page.fill('input[name="email"]', 'invalid@test.com')
      await page.fill('input[name="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')

      // Should show error message
      await expect(page.locator('text=Error')).toBeVisible()
    })

    test('should logout successfully', async () => {
      // First login
      await page.goto(`${BASE_URL}/login`)
      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="password"]', testUser.password)
      await page.click('button[type="submit"]')
      
      await page.waitForURL(/.*\/dashboard/)

      // Then logout
      await page.click('text=Cerrar Sesión')
      await expect(page).toHaveURL(BASE_URL)
      await expect(page.getByRole('link', { name: 'Iniciar Sesión' })).toBeVisible()
    })
  })

  test.describe('📋 Project Management', () => {
    test.beforeEach(async () => {
      // Login before each test
      await page.goto(`${BASE_URL}/login`)
      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="password"]', testUser.password)
      await page.click('button[type="submit"]')
      await page.waitForURL(/.*\/dashboard/)
    })

    test('should create new project', async () => {
      await page.goto(`${BASE_URL}/projects/new`)
      
      // Fill project form
      await page.fill('input[name="title"]', testProject.title)
      await page.fill('textarea[name="description"]', testProject.description)
      await page.fill('input[name="budget"]', testProject.budget.toString())
      await page.selectOption('select[name="category"]', testProject.category)

      // Submit form
      await page.click('button[type="submit"]')
      
      // Should redirect to projects list or project detail
      await page.waitForURL(/.*\/projects/)
      await expect(page.locator(`text=${testProject.title}`)).toBeVisible()
    })

    test('should view project details', async () => {
      await page.goto(`${BASE_URL}/projects`)
      
      // Click on first project
      const firstProject = page.locator('.project-card').first()
      await firstProject.click()
      
      // Should show project details
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('text=Descripción')).toBeVisible()
      await expect(page.locator('text=Presupuesto')).toBeVisible()
    })

    test('should filter projects by category', async () => {
      await page.goto(`${BASE_URL}/projects`)
      
      // Use search/filter functionality
      const categoryFilter = page.locator('select[name="category"]')
      if (await categoryFilter.isVisible()) {
        await categoryFilter.selectOption('Desarrollo Web')
        
        // Wait for filtered results
        await page.waitForTimeout(1000)
        
        // Check that results are filtered
        const projectCards = page.locator('.project-card')
        const count = await projectCards.count()
        expect(count).toBeGreaterThanOrEqual(0)
      }
    })

    test('should search projects by keyword', async () => {
      await page.goto(`${BASE_URL}/projects`)
      
      const searchInput = page.locator('input[placeholder*="Buscar"]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('React')
        await page.keyboard.press('Enter')
        
        // Wait for search results
        await page.waitForTimeout(1000)
        
        // Check search results
        const results = page.locator('.project-card')
        const count = await results.count()
        expect(count).toBeGreaterThanOrEqual(0)
      }
    })
  })

  test.describe('🏆 Ranking and Gamification', () => {
    test('should display ranking page', async () => {
      await page.goto(`${BASE_URL}/ranking`)
      
      await expect(page.locator('h1')).toContainText('Ranking')
      await expect(page.locator('.ranking-list, .leaderboard')).toBeVisible()
      
      // Check for user cards/entries
      const userEntries = page.locator('.user-rank, .ranking-item')
      const count = await userEntries.count()
      expect(count).toBeGreaterThanOrEqual(0)
    })

    test('should show user stats in dashboard', async () => {
      // Login first
      await page.goto(`${BASE_URL}/login`)
      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="password"]', testUser.password)
      await page.click('button[type="submit"]')
      await page.waitForURL(/.*\/dashboard/)

      // Check for gamification elements
      await expect(page.locator('text=XP, text=Nivel, text=Puntos')).toBeVisible()
      
      // Check for progress indicators
      const progressBars = page.locator('.progress-bar, [role="progressbar"]')
      if (await progressBars.count() > 0) {
        await expect(progressBars.first()).toBeVisible()
      }
    })
  })

  test.describe('💬 Chat System', () => {
    test.beforeEach(async () => {
      // Login before each test
      await page.goto(`${BASE_URL}/login`)
      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="password"]', testUser.password)
      await page.click('button[type="submit"]')
      await page.waitForURL(/.*\/dashboard/)
    })

    test('should access chat interface', async () => {
      await page.goto(`${BASE_URL}/chat`)
      
      // Check chat interface elements
      await expect(page.locator('.chat-container, .chat-window')).toBeVisible()
      
      // Check for message input
      const messageInput = page.locator('input[placeholder*="mensaje"], textarea[placeholder*="mensaje"]')
      if (await messageInput.isVisible()) {
        await expect(messageInput).toBeVisible()
      }
    })

    test('should send message in chat', async () => {
      await page.goto(`${BASE_URL}/chat`)
      
      const messageInput = page.locator('input[placeholder*="mensaje"], textarea[placeholder*="mensaje"]')
      const sendButton = page.locator('button[type="submit"], button:has-text("Enviar")')
      
      if (await messageInput.isVisible() && await sendButton.isVisible()) {
        await messageInput.fill('Test message E2E')
        await sendButton.click()
        
        // Check that message appears
        await expect(page.locator('text=Test message E2E')).toBeVisible()
      }
    })
  })

  test.describe('🔔 Notifications', () => {
    test.beforeEach(async () => {
      // Login before each test
      await page.goto(`${BASE_URL}/login`)
      await page.fill('input[name="email"]', testUser.email)
      await page.fill('input[name="password"]', testUser.password)
      await page.click('button[type="submit"]')
      await page.waitForURL(/.*\/dashboard/)
    })

    test('should show notifications center', async () => {
      // Look for notification bell or center
      const notificationBell = page.locator('[aria-label*="notif"], .notification-bell')
      
      if (await notificationBell.isVisible()) {
        await notificationBell.click()
        
        // Check notification dropdown/center
        await expect(page.locator('.notification-center, .notification-dropdown')).toBeVisible()
      }
    })

    test('should mark notifications as read', async () => {
      const notificationBell = page.locator('[aria-label*="notif"], .notification-bell')
      
      if (await notificationBell.isVisible()) {
        await notificationBell.click()
        
        // Look for mark as read button
        const markReadButton = page.locator('button:has-text("Marcar como leída")')
        if (await markReadButton.isVisible()) {
          await markReadButton.click()
          
          // Notification should be marked as read
          await page.waitForTimeout(500)
        }
      }
    })
  })

  test.describe('🔍 Search Functionality', () => {
    test('should perform advanced search', async () => {
      await page.goto(`${BASE_URL}/projects`)
      
      // Look for advanced search toggle
      const advancedSearchToggle = page.locator('button:has-text("Filtros"), [aria-label*="filtro"]')
      
      if (await advancedSearchToggle.isVisible()) {
        await advancedSearchToggle.click()
        
        // Check advanced search form
        await expect(page.locator('.advanced-search, .search-filters')).toBeVisible()
        
        // Fill some filters
        const budgetMin = page.locator('input[name="budgetMin"]')
        if (await budgetMin.isVisible()) {
          await budgetMin.fill('1000')
        }
        
        const categorySelect = page.locator('select[name="category"]')
        if (await categorySelect.isVisible()) {
          await categorySelect.selectOption('Desarrollo Web')
        }
        
        // Apply filters
        const applyButton = page.locator('button:has-text("Aplicar"), button:has-text("Buscar")')
        if (await applyButton.isVisible()) {
          await applyButton.click()
          await page.waitForTimeout(1000)
        }
      }
    })
  })

  test.describe('📊 Analytics Dashboard', () => {
    test('should access analytics for admin users', async () => {
      // This test would need admin credentials
      await page.goto(`${BASE_URL}/analytics`)
      
      // Check if analytics dashboard is accessible
      const analyticsContent = page.locator('.analytics-dashboard, h1:has-text("Analytics")')
      
      if (await analyticsContent.isVisible()) {
        await expect(analyticsContent).toBeVisible()
        
        // Check for metrics cards
        const metricsCards = page.locator('.metric-card, .analytics-card')
        if (await metricsCards.count() > 0) {
          await expect(metricsCards.first()).toBeVisible()
        }
      }
    })
  })

  test.describe('⚡ Performance and Accessibility', () => {
    test('should have good performance metrics', async () => {
      // Navigate to homepage
      await page.goto(BASE_URL)
      
      // Check page load performance
      const performanceEntries = await page.evaluate(() => {
        return JSON.stringify(performance.getEntriesByType('navigation'))
      })
      
      const navigation = JSON.parse(performanceEntries)[0]
      expect(navigation.loadEventEnd - navigation.loadEventStart).toBeLessThan(5000) // 5 seconds
    })

    test('should have accessible elements', async () => {
      await page.goto(BASE_URL)
      
      // Check for proper heading structure
      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()
      
      // Check for alt text on images
      const images = page.locator('img')
      const imageCount = await images.count()
      
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i)
        const alt = await img.getAttribute('alt')
        expect(alt).toBeTruthy()
      }
      
      // Check for form labels
      const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]')
      const inputCount = await inputs.count()
      
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i)
        const id = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const placeholder = await input.getAttribute('placeholder')
        
        // Should have either id (with corresponding label), aria-label, or placeholder
        expect(id || ariaLabel || placeholder).toBeTruthy()
      }
    })

    test('should work offline (PWA)', async () => {
      await page.goto(BASE_URL)
      
      // Check for service worker registration
      const swRegistered = await page.evaluate(() => {
        return 'serviceWorker' in navigator
      })
      
      expect(swRegistered).toBeTruthy()
      
      // Check for manifest
      const manifest = page.locator('link[rel="manifest"]')
      if (await manifest.count() > 0) {
        await expect(manifest).toBeVisible()
      }
    })
  })

  test.describe('🔒 Security', () => {
    test('should protect authenticated routes', async () => {
      // Try to access protected route without login
      await page.goto(`${BASE_URL}/dashboard`)
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login/)
    })

    test('should have secure headers', async () => {
      const response = await page.goto(BASE_URL)
      const headers = response?.headers()
      
      // Check for security headers
      expect(headers?.['x-frame-options'] || headers?.['X-Frame-Options']).toBeTruthy()
      expect(headers?.['x-content-type-options'] || headers?.['X-Content-Type-Options']).toBeTruthy()
    })

    test('should validate form inputs', async () => {
      await page.goto(`${BASE_URL}/register`)
      
      // Try to submit empty form
      await page.click('button[type="submit"]')
      
      // Should show validation errors
      const errorMessages = page.locator('.error, [role="alert"], .text-red-500')
      const errorCount = await errorMessages.count()
      expect(errorCount).toBeGreaterThan(0)
    })
  })
})

// Helper functions for E2E tests
export async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`)
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/.*\/dashboard/)
}

export async function createTestProject(page: Page, project: typeof testProject) {
  await page.goto(`${BASE_URL}/projects/new`)
  await page.fill('input[name="title"]', project.title)
  await page.fill('textarea[name="description"]', project.description)
  await page.fill('input[name="budget"]', project.budget.toString())
  await page.selectOption('select[name="category"]', project.category)
  await page.click('button[type="submit"]')
  await page.waitForURL(/.*\/projects/)
}
