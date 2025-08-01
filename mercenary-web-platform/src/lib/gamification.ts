import { prisma } from '@/lib/prisma'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'PROJECTS' | 'EARNINGS' | 'RATINGS' | 'SOCIAL' | 'SPECIAL'
  points: number
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  requirements: Record<string, any>
}

export interface UserStats {
  totalProjects: number
  completedProjects: number
  totalEarnings: number
  averageRating: number
  totalReviews: number
  streakDays: number
  level: number
  experience: number
  nextLevelXP: number
}

export interface LeaderboardEntry {
  userId: string
  user: {
    name: string
    avatar?: string
    isVerified: boolean
  }
  points: number
  level: number
  rank: number
  change: number // Position change from previous period
}

export class GamificationService {
  // Experience points calculation
  static calculateXP(action: string, metadata?: Record<string, any>): number {
    const xpTable = {
      'profile_complete': 100,
      'project_created': 50,
      'project_completed': 200,
      'first_project': 150,
      'perfect_rating': 100,
      'fast_delivery': 75,
      'client_review': 25,
      'freelancer_review': 25,
      'payment_completed': 50,
      'identity_verified': 200,
      'skill_added': 10,
      'daily_login': 5,
      'weekly_streak': 50,
      'monthly_streak': 200,
      'referral_signup': 100,
      'chat_message': 1,
      'project_milestone': 30
    }

    let baseXP = xpTable[action as keyof typeof xpTable] || 0

    // Bonus multipliers
    if (metadata?.isFirstTime) baseXP *= 1.5
    if (metadata?.isPerfect) baseXP *= 1.2
    if (metadata?.isEarly) baseXP *= 1.1

    return Math.floor(baseXP)
  }

  // Level calculation
  static calculateLevel(totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number } {
    // Level formula: XP needed = level^2 * 100
    let level = 1
    let totalNeeded = 0

    while (totalNeeded <= totalXP) {
      level++
      totalNeeded += level * level * 100
    }

    level-- // Go back to the actual level
    const currentLevelStart = level === 1 ? 0 : Array.from({length: level - 1}, (_, i) => (i + 2) * (i + 2) * 100).reduce((a, b) => a + b, 0)
    const currentLevelXP = totalXP - currentLevelStart
    const nextLevelXP = (level + 1) * (level + 1) * 100

    return { level, currentLevelXP, nextLevelXP }
  }

  // Award experience points
  static async awardXP(userId: string, action: string, metadata?: Record<string, any>) {
    const xp = this.calculateXP(action, metadata)
    
    if (xp <= 0) return

    try {
      // Update user XP
      const updatedProfile = await prisma.profile.update({
        where: { userId: userId },
        data: {
          xp: { increment: xp }
        },
        select: {
          xp: true
        }
      })

      const newLevel = this.calculateLevel(updatedProfile.xp).level

      // Update level if changed
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true }
      })

      if (currentUser && newLevel > (currentUser.level || 1)) {
        await prisma.user.update({
          where: { id: userId },
          data: { level: newLevel }
        })

        // Award level-up bonus
        await this.checkLevelUpAchievements(userId, newLevel)
      }

      // Log XP transaction
      await prisma.xpTransaction.create({
        data: {
          userId,
          action,
          amount: xp,
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      })

      // Check for achievements
      await this.checkAchievements(userId, action, metadata)

      return { xp, newLevel: level }
    } catch (error) {
      console.error('Error awarding XP:', error)
      throw error
    }
  }

  // Check and award achievements
  static async checkAchievements(userId: string, action: string, metadata?: Record<string, any>) {
    const achievements = await this.getAchievements()
    const userStats = await this.getUserStats(userId)
    
    for (const achievement of achievements) {
      // Check if user already has this achievement
      const existing = await prisma.userAchievement.findFirst({
        where: {
          userId,
          achievementId: achievement.id
        }
      })

      if (existing) continue

      // Check if requirements are met
      if (this.checkAchievementRequirements(achievement, userStats, action, metadata)) {
        await this.awardAchievement(userId, achievement.id)
      }
    }
  }

  // Award achievement
  static async awardAchievement(userId: string, achievementId: string) {
    try {
      const achievement = await prisma.achievement.findUnique({
        where: { id: achievementId }
      })

      if (!achievement) return

      // Award the achievement
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId,
          unlockedAt: new Date()
        }
      })

      // Award bonus XP
      await this.awardXP(userId, 'achievement_unlocked', {
        achievementId,
        bonusXP: achievement.points
      })

      return achievement
    } catch (error) {
      console.error('Error awarding achievement:', error)
    }
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<UserStats> {
    const [user, projects, transactions, reviews] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          totalXP: true,
          level: true,
          lastLoginAt: true
        }
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { clientId: userId },
            { freelancerId: userId }
          ]
        },
        select: {
          status: true,
          completedAt: true
        }
      }),
      prisma.transaction.findMany({
        where: {
          OR: [
            { clientId: userId },
            { freelancerId: userId }
          ],
          status: 'COMPLETED'
        },
        select: {
          amount: true
        }
      }),
      prisma.review.findMany({
        where: { revieweeId: userId },
        select: {
          rating: true
        }
      })
    ])

    if (!user) throw new Error('User not found')

    const totalProjects = projects.length
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length
    const totalEarnings = transactions.reduce((sum, t) => sum + t.amount, 0)
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0

    // Calculate streak (simplified)
    const streakDays = this.calculateLoginStreak(user.lastLoginAt)

    const { level, currentLevelXP, nextLevelXP } = this.calculateLevel(user.totalXP || 0)

    return {
      totalProjects,
      completedProjects,
      totalEarnings,
      averageRating,
      totalReviews: reviews.length,
      streakDays,
      level,
      experience: currentLevelXP,
      nextLevelXP
    }
  }

  // Get leaderboard
  static async getLeaderboard(
    type: 'xp' | 'level' | 'earnings' | 'projects' = 'xp',
    timeframe: 'all' | 'month' | 'week' = 'all',
    limit: number = 50
  ): Promise<LeaderboardEntry[]> {
    let orderBy: any = { totalXP: 'desc' }
    
    switch (type) {
      case 'level':
        orderBy = { level: 'desc' }
        break
      case 'earnings':
        // This would need a computed field or separate query
        break
      case 'projects':
        // This would need a computed field or separate query
        break
    }

    const users = await prisma.user.findMany({
      where: {
        totalXP: { gt: 0 }
      },
      orderBy,
      take: limit,
      select: {
        id: true,
        name: true,
        avatar: true,
        isVerified: true,
        totalXP: true,
        level: true
      }
    })

    return users.map((user, index) => ({
      userId: user.id,
      user: {
        name: user.name || 'Usuario',
        avatar: user.avatar,
        isVerified: user.isVerified || false
      },
      points: user.totalXP || 0,
      level: user.level || 1,
      rank: index + 1,
      change: 0 // Would need historical data to calculate
    }))
  }

  // Get user achievements
  static async getUserAchievements(userId: string) {
    return await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: { unlockedAt: 'desc' }
    })
  }

  // Get all available achievements
  static async getAchievements(): Promise<Achievement[]> {
    const achievements = await prisma.achievement.findMany({
      orderBy: { category: 'asc' }
    })

    return achievements.map(a => ({
      ...a,
      requirements: a.requirements ? JSON.parse(a.requirements as string) : {}
    }))
  }

  // Initialize default achievements
  static async initializeAchievements() {
    const defaultAchievements = [
      {
        id: 'first-project',
        name: 'Primer Proyecto',
        description: 'Completa tu primer proyecto exitosamente',
        icon: '🎯',
        category: 'PROJECTS',
        points: 100,
        rarity: 'COMMON',
        requirements: { completedProjects: 1 }
      },
      {
        id: 'project-master',
        name: 'Maestro de Proyectos',
        description: 'Completa 10 proyectos',
        icon: '👑',
        category: 'PROJECTS',
        points: 500,
        rarity: 'RARE',
        requirements: { completedProjects: 10 }
      },
      {
        id: 'perfect-rating',
        name: 'Perfección',
        description: 'Mantén una calificación promedio de 5.0',
        icon: '⭐',
        category: 'RATINGS',
        points: 200,
        rarity: 'EPIC',
        requirements: { averageRating: 5.0, totalReviews: 5 }
      },
      {
        id: 'early-bird',
        name: 'Madrugador',
        description: 'Inicia sesión 7 días consecutivos',
        icon: '🌅',
        category: 'SOCIAL',
        points: 150,
        rarity: 'COMMON',
        requirements: { streakDays: 7 }
      },
      {
        id: 'big-earner',
        name: 'Gran Ganador',
        description: 'Gana más de $50,000 en total',
        icon: '💰',
        category: 'EARNINGS',
        points: 1000,
        rarity: 'LEGENDARY',
        requirements: { totalEarnings: 50000 }
      },
      {
        id: 'level-10',
        name: 'Veterano',
        description: 'Alcanza el nivel 10',
        icon: '🏆',
        category: 'SPECIAL',
        points: 300,
        rarity: 'RARE',
        requirements: { level: 10 }
      }
    ]

    for (const achievement of defaultAchievements) {
      await prisma.achievement.upsert({
        where: { id: achievement.id },
        update: {},
        create: {
          ...achievement,
          requirements: JSON.stringify(achievement.requirements)
        }
      })
    }
  }

  // Helper methods
  private static checkAchievementRequirements(
    achievement: Achievement,
    userStats: UserStats,
    action: string,
    metadata?: Record<string, any>
  ): boolean {
    const req = achievement.requirements

    // Check numeric requirements
    if (req.completedProjects && userStats.completedProjects < req.completedProjects) return false
    if (req.totalEarnings && userStats.totalEarnings < req.totalEarnings) return false
    if (req.averageRating && userStats.averageRating < req.averageRating) return false
    if (req.totalReviews && userStats.totalReviews < req.totalReviews) return false
    if (req.streakDays && userStats.streakDays < req.streakDays) return false
    if (req.level && userStats.level < req.level) return false

    // Check action-based requirements
    if (req.action && action !== req.action) return false

    return true
  }

  private static calculateLoginStreak(lastLoginAt: Date | null): number {
    if (!lastLoginAt) return 0

    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastLoginAt.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Simplified streak calculation
    return diffDays <= 1 ? Math.min(diffDays, 30) : 0
  }

  private static async checkLevelUpAchievements(userId: string, newLevel: number) {
    // Check for level-based achievements
    const levelAchievements = [5, 10, 25, 50, 100]
    
    for (const targetLevel of levelAchievements) {
      if (newLevel >= targetLevel) {
        const achievementId = `level-${targetLevel}`
        
        // Check if achievement exists and user doesn't have it
        const achievement = await prisma.achievement.findUnique({
          where: { id: achievementId }
        })

        if (achievement) {
          const existing = await prisma.userAchievement.findFirst({
            where: { userId, achievementId }
          })

          if (!existing) {
            await this.awardAchievement(userId, achievementId)
          }
        }
      }
    }
  }
}
