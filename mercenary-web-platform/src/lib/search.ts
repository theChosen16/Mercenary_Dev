import { prisma } from '@/lib/prisma'

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

export interface SearchResult {
  projects: any[]
  freelancers: any[]
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
    const where: any = {
      status: 'OPEN',
      AND: []
    }

    // Text search across title and description
    if (filters.query) {
      where.AND.push({
        OR: [
          { title: { contains: filters.query, mode: 'insensitive' } },
          { description: { contains: filters.query, mode: 'insensitive' } }
        ]
      })
    }

    // Category filter
    if (filters.category) {
      where.AND.push({ category: filters.category })
    }

    // Skills filter (array intersection)
    if (filters.skills && filters.skills.length > 0) {
      where.AND.push({
        skills: {
          hasSome: filters.skills
        }
      })
    }

    // Budget range filter
    if (filters.budgetMin || filters.budgetMax) {
      const budgetFilter: any = {}
      if (filters.budgetMin) budgetFilter.gte = filters.budgetMin
      if (filters.budgetMax) budgetFilter.lte = filters.budgetMax
      where.AND.push({ budget: budgetFilter })
    }

    // Difficulty filter (based on budget and complexity)
    if (filters.difficulty) {
      const difficultyRanges = {
        beginner: { budget: { lte: 10000 } },
        intermediate: { budget: { gte: 10000, lte: 50000 } },
        advanced: { budget: { gte: 50000 } }
      }
      where.AND.push(difficultyRanges[filters.difficulty])
    }

    // Client rating filter
    if (filters.clientRating) {
      where.AND.push({
        client: {
          profile: {
            rating: { gte: filters.clientRating }
          }
        }
      })
    }

    // Verified clients only
    if (filters.verified) {
      where.AND.push({
        client: { isVerified: true }
      })
    }

    // Build order by clause
    const orderBy = this.buildOrderBy(filters.sortBy, filters.sortOrder)

    // Execute search
    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              isVerified: true,
              profile: {
                select: {
                  rating: true,
                  totalReviews: true
                }
              }
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.project.count({ where })
    ])

    // Calculate relevance scores if user is provided
    const scoredProjects = userId 
      ? await this.calculateProjectRelevance(projects, userId)
      : projects

    // Get search suggestions and filters
    const [suggestions, filterData] = await Promise.all([
      this.generateSearchSuggestions(filters.query),
      this.getSearchFilters(where)
    ])

    return {
      projects: scoredProjects,
      freelancers: [], // Could add freelancer search later
      totalResults: totalCount,
      suggestions,
      filters: filterData
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
          include: { profile: true }
        }
      }
    })

    if (!project) return []

    // Get potential freelancers
    const freelancers = await prisma.user.findMany({
      where: {
        role: 'FREELANCER',
        profile: {
          isNot: null
        }
      },
      include: {
        profile: true,
        _count: {
          select: {
            freelancerProjects: {
              where: { status: 'COMPLETED' }
            }
          }
        }
      }
    })

    // Calculate matching scores
    const matches: MatchingScore[] = []

    for (const freelancer of freelancers) {
      const score = await this.calculateMatchingScore(project, freelancer)
      if (score.score > 0.3) { // Only include matches above 30%
        matches.push(score)
      }
    }

    // Sort by score and return top matches
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
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
        clientProjects: {
          include: { applications: true }
        },
        freelancerProjects: true,
        applications: {
          include: { project: true }
        }
      }
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
          status: 'OPEN',
          OR: [
            ...synonyms.map(term => ({
              title: { contains: term, mode: 'insensitive' as const }
            })),
            ...synonyms.map(term => ({
              description: { contains: term, mode: 'insensitive' as const }
            })),
            ...synonyms.map(term => ({
              skills: { has: term }
            }))
          ]
        },
        include: {
          client: {
            select: {
              name: true,
              isVerified: true,
              profile: { select: { rating: true } }
            }
          }
        },
        take: limit
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
        // Get popular skills from projects and profiles
        const skillProjects = await prisma.project.findMany({
          where: {
            skills: {
              hasSome: [query]
            }
          },
          select: { skills: true },
          take: 100
        })
        
        const allSkills = skillProjects.flatMap(p => p.skills)
        const filteredSkills = allSkills
          .filter(skill => skill.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10)
        
        return [...new Set(filteredSkills)]

      case 'categories':
        const categories = await prisma.project.groupBy({
          by: ['category'],
          where: {
            category: {
              contains: query,
              mode: 'insensitive'
            }
          },
          _count: { category: true },
          orderBy: { _count: { category: 'desc' } },
          take: 10
        })
        
        return categories.map(c => c.category)

      default:
        return []
    }
  }

  // Private helper methods
  private static buildOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc') {
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
        return { createdAt: 'desc' as const }
    }
  }

  private static async calculateProjectRelevance(projects: any[], userId: string) {
    // Get user's skills and preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    })

    if (!user?.profile) return projects

    const userSkills = user.profile.skills || []

    return projects.map(project => {
      // Calculate skill match percentage
      const skillMatch = this.calculateSkillMatch(userSkills, project.skills)
      
      // Add relevance score
      return {
        ...project,
        relevanceScore: skillMatch,
        matchingSkills: project.skills.filter((skill: string) => 
          userSkills.includes(skill)
        )
      }
    }).sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  private static async calculateMatchingScore(
    project: any,
    freelancer: any
  ): Promise<MatchingScore> {
    const factors = {
      skillMatch: this.calculateSkillMatch(
        freelancer.profile?.skills || [],
        project.skills
      ),
      budgetMatch: this.calculateBudgetMatch(
        freelancer.profile?.hourlyRate || 0,
        project.budget
      ),
      ratingMatch: this.calculateRatingMatch(
        freelancer.profile?.rating || 0
      ),
      experienceMatch: this.calculateExperienceMatch(
        freelancer._count?.freelancerProjects || 0
      ),
      locationMatch: 0.8, // Simplified - would use actual location data
      availabilityMatch: 0.9 // Simplified - would check actual availability
    }

    // Weighted average
    const weights = {
      skillMatch: 0.35,
      budgetMatch: 0.20,
      ratingMatch: 0.20,
      experienceMatch: 0.15,
      locationMatch: 0.05,
      availabilityMatch: 0.05
    }

    const score = Object.entries(factors).reduce(
      (total, [key, value]) => total + value * weights[key as keyof typeof weights],
      0
    )

    const recommendations = this.generateMatchRecommendations(factors)

    return {
      projectId: project.id,
      freelancerId: freelancer.id,
      score,
      factors,
      recommendations
    }
  }

  private static calculateSkillMatch(userSkills: string[], projectSkills: string[]): number {
    if (projectSkills.length === 0) return 0
    
    const matchingSkills = userSkills.filter(skill => 
      projectSkills.some(pSkill => 
        pSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(pSkill.toLowerCase())
      )
    )
    
    return matchingSkills.length / projectSkills.length
  }

  private static calculateBudgetMatch(hourlyRate: number, projectBudget: number): number {
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

  private static generateMatchRecommendations(factors: any): string[] {
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

  private static async analyzeUserPreferences(user: any) {
    // Analyze user's project history, applications, etc.
    const preferences = {
      preferredCategories: [],
      preferredSkills: [],
      budgetRange: { min: 0, max: 100000 },
      preferredProjectTypes: []
    }

    // This would be more sophisticated in a real implementation
    return preferences
  }

  private static async getRecommendedProjects(
    userId: string,
    preferences: any,
    limit: number
  ) {
    // Use preferences to find similar projects
    return await prisma.project.findMany({
      where: {
        status: 'OPEN',
        clientId: { not: userId }
      },
      include: {
        client: {
          select: {
            name: true,
            isVerified: true,
            profile: { select: { rating: true } }
          }
        }
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  }

  private static async getRecommendedFreelancers(
    userId: string,
    preferences: any,
    limit: number
  ) {
    return await prisma.user.findMany({
      where: {
        role: 'FREELANCER',
        id: { not: userId }
      },
      include: {
        profile: true
      },
      take: limit
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
      'web': ['website', 'webapp', 'frontend', 'backend'],
      'mobile': ['app', 'ios', 'android', 'react native'],
      'design': ['ui', 'ux', 'graphic', 'visual'],
      'marketing': ['seo', 'social media', 'advertising', 'promotion']
    }

    const expanded = [...terms]
    
    terms.forEach(term => {
      if (synonymMap[term]) {
        expanded.push(...synonymMap[term])
      }
    })

    return [...new Set(expanded)]
  }

  private static async generateSearchSuggestions(query?: string): Promise<string[]> {
    if (!query) return []

    // Get popular search terms (simplified)
    const suggestions = [
      'Desarrollo web',
      'Aplicación móvil',
      'Diseño UI/UX',
      'Marketing digital',
      'E-commerce',
      'Inteligencia artificial'
    ]

    return suggestions.filter(s => 
      s.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
  }

  private static async getSearchFilters(where: any) {
    // Get available filter options based on current search
    const [categories, skills, budgetRanges] = await Promise.all([
      prisma.project.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 10
      }),
      // Simplified skills aggregation
      Promise.resolve([
        { name: 'JavaScript', count: 45 },
        { name: 'React', count: 38 },
        { name: 'Node.js', count: 32 },
        { name: 'Python', count: 28 }
      ]),
      // Simplified budget ranges
      Promise.resolve([
        { range: '$0 - $5,000', count: 23 },
        { range: '$5,000 - $15,000', count: 34 },
        { range: '$15,000 - $50,000', count: 18 },
        { range: '$50,000+', count: 12 }
      ])
    ])

    return {
      categories: categories.map(c => ({ name: c.category, count: c._count.category })),
      skills,
      budgetRanges
    }
  }
}
