import { prisma } from '@/lib/prisma'
import type { Prisma, Project, Profile } from '@prisma/client'

export interface SearchFilters {
  query?: string
  category?: string
  skills?: string[]
  budgetMin?: number
  budgetMax?: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  location?: string
  projectType?: 'remote' | 'onsite' | 'hybrid'
  deadline?: 'urgent' | 'week' | 'month' | 'flexible'
  clientRating?: number
  verified?: boolean
  sortBy?: 'relevance' | 'budget' | 'deadline' | 'rating' | 'recent'
  sortOrder?: 'asc' | 'desc'
}

type ProjectWithClient = Prisma.ProjectGetPayload<{
  include: {
    client: {
      select: { id: true; name: true; profile: { select: { rating: true } } }
    }
  }
}>

export type ScoredProject = ProjectWithClient & {
  relevanceScore?: number
  matchingSkills?: string[]
}

export interface SearchResult {
  projects: ScoredProject[]
  freelancers: Array<Prisma.UserGetPayload<{ include: { profile: true } }>>
  totalResults: number
  suggestions: string[]
  filters: {
    categories: Array<{ name: string; count: number }>
    skills: Array<{ name: string; count: number }>
    budgetRanges: Array<{ range: string; count: number }>
  }
}

export interface MatchingScore {
  projectId: string
  freelancerId: string
  score: number
  factors: {
    skillMatch: number
    budgetMatch: number
    ratingMatch: number
    experienceMatch: number
    locationMatch: number
    availabilityMatch: number
  }
  recommendations: string[]
}

type UserPreferences = {
  preferredCategories: string[]
  preferredSkills: string[]
  budgetRange: { min: number; max: number }
  preferredProjectTypes: string[]
}

export class IntelligentSearchService {
  // Advanced project search with AI-like scoring
  static async searchProjects(
    filters: SearchFilters,
    userId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResult> {
    const skip = (page - 1) * limit

    // Build dynamic where clause
    const andConditions: Prisma.ProjectWhereInput[] = []

    // Text search across title and description
    if (filters.query) {
      andConditions.push({
        OR: [
          { title: { contains: filters.query } },
          { description: { contains: filters.query } },
        ],
      })
    }

    // Category filter
    if (filters.category) {
      andConditions.push({ category: filters.category })
    }

    // Skills filter (String column contains any of the terms)
    if (filters.skills && filters.skills.length > 0) {
      andConditions.push({
        OR: filters.skills.map(skill => ({
          skills: { contains: skill },
        })),
      })
    }

    // Budget range filter
    if (filters.budgetMin || filters.budgetMax) {
      const budgetFilter: Prisma.FloatFilter = {}
      if (filters.budgetMin) budgetFilter.gte = filters.budgetMin
      if (filters.budgetMax) budgetFilter.lte = filters.budgetMax
      andConditions.push({ budget: budgetFilter })
    }

    // Difficulty filter (based on budget and complexity)
    if (filters.difficulty) {
      const difficultyRanges = {
        beginner: { budget: { lte: 10000 } },
        intermediate: { budget: { gte: 10000, lte: 50000 } },
        advanced: { budget: { gte: 50000 } },
      }
      andConditions.push(difficultyRanges[filters.difficulty])
    }

    // Client rating filter
    if (filters.clientRating) {
      andConditions.push({
        client: {
          profile: {
            rating: { gte: filters.clientRating },
          },
        },
      })
    }

    // Verified clients only
    if (filters.verified) {
      andConditions.push({
        client: { emailVerified: { not: null } },
      })
    }

    // Build order by clause
    const orderBy = this.buildOrderBy(filters.sortBy, filters.sortOrder)

    // Execute search
    const finalWhere: Prisma.ProjectWhereInput = {
      status: 'ACTIVE',
      AND: andConditions.length ? andConditions : undefined,
    }

    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where: finalWhere,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.project.count({ where: finalWhere }),
    ])

    // Calculate relevance scores if user is provided
    const scoredProjects = userId
      ? await this.calculateProjectRelevance(projects, userId)
      : projects

    // Get search suggestions and filters
    const [suggestions, filterData] = await Promise.all([
      this.generateSearchSuggestions(filters.query),
      this.getSearchFilters(),
    ])

    return {
      projects: scoredProjects,
      freelancers: [], // Could add freelancer search later
      totalResults: totalCount,
      suggestions,
      filters: filterData,
    }
  }

  // AI-powered matching algorithm
  static async findBestMatches(
    projectId: string,
    limit: number = 10
  ): Promise<MatchingScore[]> {
    // Get project details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: {
          include: { profile: true },
        },
      },
    })

    if (!project) return []

    // Get potential freelancers
    const freelancers = await prisma.user.findMany({
      where: {
        role: 'FREELANCER',
        profile: {
          isNot: null,
        },
      },
      include: {
        profile: true,
        _count: {
          select: {
            freelancerProjects: true,
          },
        },
      },
    })

    // Calculate matching scores
    const matches: MatchingScore[] = []

    for (const freelancer of freelancers) {
      const score = await this.calculateMatchingScore(project, freelancer)
      if (score.score > 0.3) {
        // Only include matches above 30%
        matches.push(score)
      }
    }

    // Sort by score and return top matches
    return matches.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  // Smart recommendations based on user behavior
  static async getPersonalizedRecommendations(
    userId: string,
    type: 'projects' | 'freelancers' = 'projects',
    limit: number = 10
  ) {
    // Get user's interaction history
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        projects: true,
        freelancerProjects: true,
      },
    })

    if (!user) return []

    // Analyze user preferences
    const preferences = await this.analyzeUserPreferences(user)

    if (type === 'projects') {
      return await this.getRecommendedProjects(userId, preferences, limit)
    } else {
      return await this.getRecommendedFreelancers(userId, preferences, limit)
    }
  }

  // Semantic search using embeddings (simplified version)
  static async semanticSearch(
    query: string,
    type: 'projects' | 'freelancers' = 'projects',
    limit: number = 20
  ) {
    // In a real implementation, this would use vector embeddings
    // For now, we'll use advanced text matching

    const searchTerms = this.extractSearchTerms(query)
    const synonyms = this.expandWithSynonyms(searchTerms)

    if (type === 'projects') {
      return await prisma.project.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            ...synonyms.map(term => ({
              title: { contains: term },
            })),
            ...synonyms.map(term => ({
              description: { contains: term },
            })),
            ...synonyms.map(term => ({
              skills: { contains: term },
            })),
          ],
        },
        include: {
          client: {
            select: {
              name: true,
              profile: { select: { rating: true } },
            },
          },
        },
        take: limit,
      })
    }

    return []
  }

  // Auto-complete suggestions
  static async getAutocompleteSuggestions(
    query: string,
    type: 'skills' | 'categories' | 'locations' = 'skills'
  ): Promise<string[]> {
    if (query.length < 2) return []

    switch (type) {
      case 'skills':
        // Get popular skills from projects (skills stored as JSON string)
        const skillProjects = await prisma.project.findMany({
          where: {
            skills: {
              contains: query,
            },
          },
          select: { skills: true },
          take: 100,
        })

        const allSkills = skillProjects.flatMap(p => this.parseSkills(p.skills))
        const filteredSkills = allSkills
          .filter(skill => skill.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10)

        return Array.from(new Set(filteredSkills))

      case 'categories':
        const categories = await prisma.project.groupBy({
          by: ['category'],
          where: {
            category: {
              contains: query,
            },
          },
          _count: { category: true },
          orderBy: { _count: { category: 'desc' } },
          take: 10,
        })

        return categories.map(c => c.category)

      default:
        return []
    }
  }

  // Private helper methods
  private static buildOrderBy(
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    const order = sortOrder

    switch (sortBy) {
      case 'budget':
        return { budget: order }
      case 'deadline':
        return { deadline: order }
      case 'rating':
        return { client: { profile: { rating: order } } }
      case 'recent':
        return { createdAt: order }
      default:
        return { createdAt: order }
    }
  }

  private static async calculateProjectRelevance(
    projects: ProjectWithClient[],
    userId: string
  ): Promise<ScoredProject[]> {
    // Get user's skills and preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    if (!user?.profile) return projects as ScoredProject[]

    const userSkills = this.parseSkills(user.profile.skills)

    return projects
      .map(project => {
        // Normalize skills from JSON string to string[] if needed
        const projectSkills = this.parseSkills(project.skills)
        // Calculate skill match percentage
        const skillMatch = this.calculateSkillMatch(userSkills, projectSkills)

        // Add relevance score
        return {
          ...project,
          relevanceScore: skillMatch,
          matchingSkills: projectSkills.filter(skill =>
            userSkills.includes(skill)
          ),
        }
      })
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
  }

  private static async calculateMatchingScore(
    project: Project,
    freelancer: Prisma.UserGetPayload<{
      include: {
        profile: true
        _count: { select: { freelancerProjects: true } }
      }
    }>
  ): Promise<MatchingScore> {
    const factors = {
      skillMatch: this.calculateSkillMatch(
        this.parseSkills(freelancer.profile?.skills as Profile['skills']),
        this.parseSkills(project.skills)
      ),
      budgetMatch: this.calculateBudgetMatch(
        freelancer.profile?.hourlyRate || 0,
        project.budget
      ),
      ratingMatch: this.calculateRatingMatch(freelancer.profile?.rating || 0),
      experienceMatch: this.calculateExperienceMatch(
        freelancer._count?.freelancerProjects || 0
      ),
      locationMatch: 0.8, // Simplified - would use actual location data
      availabilityMatch: 0.9, // Simplified - would check actual availability
    }

    // Weighted average
    const weights = {
      skillMatch: 0.35,
      budgetMatch: 0.2,
      ratingMatch: 0.2,
      experienceMatch: 0.15,
      locationMatch: 0.05,
      availabilityMatch: 0.05,
    }

    const score = Object.entries(factors).reduce(
      (total, [key, value]) =>
        total + value * weights[key as keyof typeof weights],
      0
    )

    const recommendations = this.generateMatchRecommendations(factors)

    return {
      projectId: project.id,
      freelancerId: freelancer.id,
      score,
      factors,
      recommendations,
    }
  }

  private static calculateSkillMatch(
    userSkills: string[],
    projectSkills: string[]
  ): number {
    if (projectSkills.length === 0) return 0

    const matchingSkills = userSkills.filter(skill =>
      projectSkills.some(
        pSkill =>
          pSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(pSkill.toLowerCase())
      )
    )

    return matchingSkills.length / projectSkills.length
  }

  private static calculateBudgetMatch(
    hourlyRate: number,
    projectBudget: number
  ): number {
    if (hourlyRate === 0) return 0.5

    const estimatedHours = 40 // Simplified estimation
    const expectedEarnings = hourlyRate * estimatedHours

    if (expectedEarnings <= projectBudget) return 1
    if (expectedEarnings <= projectBudget * 1.2) return 0.8
    if (expectedEarnings <= projectBudget * 1.5) return 0.6
    return 0.3
  }

  private static calculateRatingMatch(rating: number): number {
    return Math.min(rating / 5, 1)
  }

  private static calculateExperienceMatch(completedProjects: number): number {
    if (completedProjects >= 20) return 1
    if (completedProjects >= 10) return 0.8
    if (completedProjects >= 5) return 0.6
    if (completedProjects >= 1) return 0.4
    return 0.2
  }

  private static generateMatchRecommendations(
    factors: MatchingScore['factors']
  ): string[] {
    const recommendations: string[] = []

    if (factors.skillMatch > 0.8) {
      recommendations.push('Excelente coincidencia de habilidades')
    } else if (factors.skillMatch > 0.5) {
      recommendations.push('Buena coincidencia de habilidades')
    }

    if (factors.budgetMatch > 0.8) {
      recommendations.push('Presupuesto muy competitivo')
    }

    if (factors.ratingMatch > 0.8) {
      recommendations.push('Freelancer altamente calificado')
    }

    return recommendations
  }

  private static async analyzeUserPreferences(
    user: Prisma.UserGetPayload<{
      include: { profile: true; projects: true; freelancerProjects: true }
    }>
  ): Promise<UserPreferences> {
    // Analyze user's project history, applications, etc.
    const preferences: UserPreferences = {
      preferredCategories: [],
      preferredSkills: this.parseSkills(
        user.profile?.skills as Profile['skills']
      ),
      budgetRange: { min: 0, max: 100000 },
      preferredProjectTypes: [],
    }

    // This would be more sophisticated in a real implementation
    return preferences
  }

  private static async getRecommendedProjects(
    userId: string,
    _preferences: UserPreferences,
    limit: number
  ) {
    // Use preferences to find similar projects
    return await prisma.project.findMany({
      where: {
        status: 'ACTIVE',
        clientId: { not: userId },
      },
      include: {
        client: {
          select: {
            name: true,
            profile: { select: { rating: true } },
          },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
  }

  private static parseSkills(value: unknown): string[] {
    if (!value) return []
    if (Array.isArray(value))
      return value.filter((s): s is string => typeof s === 'string')
    if (typeof value === 'string') {
      try {
        const arr = JSON.parse(value)
        return Array.isArray(arr)
          ? arr.filter((s): s is string => typeof s === 'string')
          : []
      } catch {
        return value
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      }
    }
    return []
  }

  private static async getRecommendedFreelancers(
    userId: string,
    _preferences: UserPreferences,
    limit: number
  ) {
    return await prisma.user.findMany({
      where: {
        role: 'FREELANCER',
        id: { not: userId },
      },
      include: {
        profile: true,
      },
      take: limit,
    })
  }

  private static extractSearchTerms(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2)
  }

  private static expandWithSynonyms(terms: string[]): string[] {
    const synonymMap: Record<string, string[]> = {
      web: ['website', 'webapp', 'frontend', 'backend'],
      mobile: ['app', 'ios', 'android', 'react native'],
      design: ['ui', 'ux', 'graphic', 'visual'],
      marketing: ['seo', 'social media', 'advertising', 'promotion'],
    }

    const expanded = [...terms]

    terms.forEach(term => {
      if (synonymMap[term]) {
        expanded.push(...synonymMap[term])
      }
    })

    return Array.from(new Set(expanded))
  }

  private static async generateSearchSuggestions(
    query?: string
  ): Promise<string[]> {
    if (!query) return []

    // Get popular search terms (simplified)
    const suggestions = [
      'Desarrollo web',
      'Aplicación móvil',
      'Diseño UI/UX',
      'Marketing digital',
      'E-commerce',
      'Inteligencia artificial',
    ]

    return suggestions
      .filter(s => s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
  }

  private static async getSearchFilters() {
    // Get available filter options based on current search
    const [categories, skills, budgetRanges] = await Promise.all([
      prisma.project.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 10,
      }),
      // Simplified skills aggregation
      Promise.resolve([
        { name: 'JavaScript', count: 45 },
        { name: 'React', count: 38 },
        { name: 'Node.js', count: 32 },
        { name: 'Python', count: 28 },
      ]),
      // Simplified budget ranges
      Promise.resolve([
        { range: '$0 - $5,000', count: 23 },
        { range: '$5,000 - $15,000', count: 34 },
        { range: '$15,000 - $50,000', count: 18 },
        { range: '$50,000+', count: 12 },
      ]),
    ])

    return {
      categories: categories.map(c => ({
        name: c.category,
        count: c._count.category,
      })),
      skills,
      budgetRanges,
    }
  }
}
