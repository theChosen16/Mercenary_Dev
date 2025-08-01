import { prisma } from '@/lib/prisma'

export interface UserStats {
  userId: string
  xp: number
  level: number
  completedProjects: number
  totalEarnings: number
  achievements: Achievement[]
  rank: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: Date
}

export class GamificationService {
  // Calculate level from XP
  static calculateLevel(xp: number): { level: number; nextLevelXP: number; progress: number } {
    const level = Math.floor(Math.sqrt(xp / 100)) + 1
    const nextLevelXP = Math.pow(level, 2) * 100
    const currentLevelXP = Math.pow(level - 1, 2) * 100
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100

    return { level, nextLevelXP, progress }
  }

  // Add XP to user
  static async addXP(userId: string, xp: number, reason: string): Promise<UserStats> {
    try {
      // Get current profile
      const profile = await prisma.profile.findUnique({
        where: { userId },
        select: { xp: true, level: true }
      })

      if (!profile) {
        throw new Error('Profile not found')
      }

      const newXP = profile.xp + xp
      const { level: newLevel } = this.calculateLevel(newXP)

      // Update profile
      await prisma.profile.update({
        where: { userId },
        data: {
          xp: newXP,
          level: newLevel
        }
      })

      return this.getUserStats(userId)
    } catch (error) {
      console.error('Error adding XP:', error)
      throw error
    }
  }

  // Get user stats
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          projects: {
            where: { status: 'COMPLETED' }
          }
        }
      })

      if (!user || !user.profile) {
        throw new Error('User or profile not found')
      }

      const completedProjects = user.projects.length
      const totalEarnings = user.profile.totalEarnings || 0
      const achievements = this.getMockAchievements(user.profile.xp, completedProjects)

      return {
        userId,
        xp: user.profile.xp,
        level: user.profile.level,
        completedProjects,
        totalEarnings,
        achievements,
        rank: 1 // Simplified
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      throw error
    }
  }

  // Get leaderboard
  static async getLeaderboard(limit: number = 10): Promise<UserStats[]> {
    try {
      const users = await prisma.user.findMany({
        include: {
          profile: true,
          projects: {
            where: { status: 'COMPLETED' }
          }
        },
        orderBy: {
          profile: {
            xp: 'desc'
          }
        },
        take: limit
      })

      return users.map((user, index) => ({
        userId: user.id,
        xp: user.profile?.xp || 0,
        level: user.profile?.level || 1,
        completedProjects: user.projects.length,
        totalEarnings: user.profile?.totalEarnings || 0,
        achievements: this.getMockAchievements(user.profile?.xp || 0, user.projects.length),
        rank: index + 1
      }))
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return []
    }
  }

  // Mock achievements for testing
  private static getMockAchievements(xp: number, completedProjects: number): Achievement[] {
    const achievements: Achievement[] = []

    if (xp >= 100) {
      achievements.push({
        id: 'first_steps',
        title: 'Primeros Pasos',
        description: 'Alcanza 100 XP',
        icon: '🎯',
        rarity: 'common',
        unlockedAt: new Date()
      })
    }

    if (completedProjects >= 1) {
      achievements.push({
        id: 'first_project',
        title: 'Primer Proyecto',
        description: 'Completa tu primer proyecto',
        icon: '🚀',
        rarity: 'common',
        unlockedAt: new Date()
      })
    }

    if (completedProjects >= 5) {
      achievements.push({
        id: 'experienced',
        title: 'Experimentado',
        description: 'Completa 5 proyectos',
        icon: '⭐',
        rarity: 'rare',
        unlockedAt: new Date()
      })
    }

    if (xp >= 1000) {
      achievements.push({
        id: 'expert',
        title: 'Experto',
        description: 'Alcanza 1000 XP',
        icon: '💎',
        rarity: 'epic',
        unlockedAt: new Date()
      })
    }

    return achievements
  }
}
