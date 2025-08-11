import { prisma } from '@/lib/prisma'
import type { Prisma, ProjectStatus } from '@prisma/client'
import {
  Badge,
  UserStreak,
  Mission,
  SubscriptionPlan,
  UserSubscription,
  UserLimits,
} from '@/types'

export class AdvancedGamificationService {
  // ===== STREAK SYSTEM =====
  static async updateJobCompletionStreak(userId: string): Promise<UserStreak> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          where: { status: 'COMPLETED' as unknown as ProjectStatus },
          orderBy: { updatedAt: 'desc' },
        },
      },
    })

    if (!user) throw new Error('Usuario no encontrado')

    const completedJobs = user.projects.length
    const lastJob = user.projects[0]
    const lastJobDate = lastJob ? new Date(lastJob.updatedAt) : null
    const today = new Date()
    const daysDiff = lastJobDate
      ? Math.floor(
          (today.getTime() - lastJobDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 999

    // Calculate current streak
    let currentStreak = 0
    if (daysDiff <= 1) {
      // Job completed today or yesterday
      currentStreak = await this.calculateConsecutiveJobs(userId)
    }

    // Update user streak data
    const streakData: UserStreak = {
      current_streak: currentStreak,
      longest_streak: Math.max(currentStreak, user.longest_streak || 0),
      last_completed_job: lastJob?.id || '',
      total_completed_jobs: completedJobs,
    }

    // Award streak badges
    await this.checkStreakBadges(userId, streakData)

    return streakData
  }

  private static async calculateConsecutiveJobs(
    userId: string
  ): Promise<number> {
    const jobs = await prisma.project.findMany({
      where: {
        freelancerId: userId,
        status: 'COMPLETED' as unknown as ProjectStatus,
      },
      orderBy: { updatedAt: 'desc' },
      take: 30, // Check last 30 jobs for streak
    })

    let streak = 0
    let lastDate: Date | null = null

    for (const job of jobs) {
      const jobDate = new Date(job.updatedAt)

      if (!lastDate) {
        streak = 1
        lastDate = jobDate
        continue
      }

      const daysDiff = Math.floor(
        (lastDate.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff <= 7) {
        // Jobs within a week count as streak
        streak++
        lastDate = jobDate
      } else {
        break
      }
    }

    return streak
  }

  // ===== BADGE SYSTEM =====
  static async checkStreakBadges(
    userId: string,
    streak: UserStreak
  ): Promise<void> {
    const streakBadges = [
      {
        threshold: 3,
        name: 'Iniciador',
        icon: '🌱',
        rarity: 'common' as const,
      },
      {
        threshold: 5,
        name: 'Constante',
        icon: '🔥',
        rarity: 'common' as const,
      },
      { threshold: 10, name: 'Dedicado', icon: '⭐', rarity: 'rare' as const },
      { threshold: 20, name: 'Imparable', icon: '🚀', rarity: 'epic' as const },
      {
        threshold: 50,
        name: 'Leyenda',
        icon: '👑',
        rarity: 'legendary' as const,
      },
    ]

    for (const badge of streakBadges) {
      if (streak.current_streak >= badge.threshold) {
        await this.awardBadge(userId, {
          id: `streak_${badge.threshold}`,
          name: badge.name,
          description: `Completó ${badge.threshold} trabajos consecutivos`,
          icon: badge.icon,
          rarity: badge.rarity,
          category: 'STREAK',
        })
      }
    }
  }

  static async awardBadge(
    userId: string,
    badge: Omit<Badge, 'earned_at'>
  ): Promise<void> {
    // No DB persistence for badges in current schema. Consider notifications/in-app display.
    const xpReward = this.getBadgeXPReward(badge.rarity)
    await this.awardXP(userId, xpReward, `Badge earned: ${badge.name}`)
  }

  private static getBadgeXPReward(rarity: Badge['rarity']): number {
    const rewards = {
      common: 50,
      rare: 100,
      epic: 200,
      legendary: 500,
    }
    return rewards[rarity]
  }

  // ===== MISSIONS SYSTEM =====
  static async generateDailyMissions(userId: string): Promise<Mission[]> {
    const missions: Mission[] = [
      {
        id: `daily_profile_${Date.now()}`,
        title: 'Perfil Completo',
        description: 'Actualiza tu perfil con foto y descripción',
        type: 'DAILY',
        xp_reward: 25,
        requirements: { profile_complete: true },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
      },
      {
        id: `daily_messages_${Date.now()}`,
        title: 'Comunicación Activa',
        description: 'Responde a 3 mensajes de clientes',
        type: 'DAILY',
        xp_reward: 30,
        requirements: { messages_replied: 3 },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
      },
      {
        id: `daily_proposal_${Date.now()}`,
        title: 'Oportunidades',
        description: 'Envía una propuesta a un proyecto',
        type: 'DAILY',
        xp_reward: 40,
        requirements: { proposals_sent: 1 },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
      },
    ]

    return missions
  }

  // ===== SUBSCRIPTION SYSTEM =====
  static getSubscriptionPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'free',
        name: 'Gratuito',
        price: 0,
        currency: 'CLP',
        interval: 'monthly',
        features: {
          max_active_jobs: 2,
          max_job_posts: 1,
          detailed_profiles: false,
          social_links_access: false,
          priority_support: false,
          reduced_fees: 0,
          advanced_analytics: false,
        },
      },
      {
        id: 'pro',
        name: 'Profesional',
        price: 9990,
        currency: 'CLP',
        interval: 'monthly',
        features: {
          max_active_jobs: 10,
          max_job_posts: 5,
          detailed_profiles: true,
          social_links_access: true,
          priority_support: true,
          reduced_fees: 20,
          advanced_analytics: true,
        },
      },
      {
        id: 'elite',
        name: 'Elite',
        price: 19990,
        currency: 'CLP',
        interval: 'monthly',
        features: {
          max_active_jobs: -1, // Unlimited
          max_job_posts: -1, // Unlimited
          detailed_profiles: true,
          social_links_access: true,
          priority_support: true,
          reduced_fees: 35,
          advanced_analytics: true,
        },
      },
    ]
  }

  static async getUserLimits(userId: string): Promise<UserLimits> {
    const subscription = await this.getUserSubscription(userId)
    const plan = subscription?.plan || this.getSubscriptionPlans()[0] // Default to free

    const currentJobs = await prisma.project.count({
      where: {
        OR: [
          {
            freelancerId: userId,
            status: {
              in: ['ACTIVE', 'IN_PROGRESS'] as unknown as ProjectStatus[],
            },
          },
          {
            clientId: userId,
            status: {
              in: ['ACTIVE', 'IN_PROGRESS'] as unknown as ProjectStatus[],
            },
          },
        ],
      },
    })

    const currentPosts = await prisma.project.count({
      where: {
        clientId: userId,
        status: { in: ['ACTIVE', 'DRAFT'] as unknown as ProjectStatus[] },
      },
    })

    return {
      max_active_jobs: plan.features.max_active_jobs,
      max_job_posts: plan.features.max_job_posts,
      current_active_jobs: currentJobs,
      current_job_posts: currentPosts,
      can_view_detailed_profiles: plan.features.detailed_profiles,
      can_access_social_links: plan.features.social_links_access,
    }
  }

  static async getUserSubscription(
    userId: string
  ): Promise<UserSubscription | null> {
    // This would typically query your subscription database
    // For now, return null (free tier)
    return null
  }

  // ===== XP SYSTEM =====
  static async awardXP(
    userId: string,
    amount: number,
    _reason: string
  ): Promise<void> {
    // Update Profile XP and Level
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: { xp: { increment: amount } },
      create: { userId, xp: amount },
      select: { xp: true, level: true },
    })

    const newLevel = this.calculateLevel(profile.xp || 0)
    await prisma.profile.update({
      where: { userId },
      data: { level: newLevel },
    })

    if (newLevel > (profile.level || 1)) {
      await this.checkLevelBadges(userId, newLevel)
    }
  }

  private static calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1
  }

  private static async checkLevelBadges(
    userId: string,
    level: number
  ): Promise<void> {
    const levelBadges = [
      { level: 5, name: 'Novato', icon: '🎯' },
      { level: 10, name: 'Experimentado', icon: '⚡' },
      { level: 20, name: 'Experto', icon: '🏆' },
      { level: 50, name: 'Maestro', icon: '👑' },
    ]

    for (const badge of levelBadges) {
      if (level >= badge.level) {
        await this.awardBadge(userId, {
          id: `level_${badge.level}`,
          name: badge.name,
          description: `Alcanzó el nivel ${badge.level}`,
          icon: badge.icon,
          rarity: 'rare',
          category: 'SPECIAL',
        })
      }
    }
  }

  // ===== LEADERBOARD =====
  static async getLeaderboard(
    type: 'xp' | 'streak' | 'completed_jobs' = 'xp',
    limit: number = 10
  ) {
    let orderBy: Prisma.UserOrderByWithRelationInput = {
      profile: { xp: 'desc' },
    }

    if (type === 'streak') {
      orderBy = { longest_streak: 'desc' }
    } else if (type === 'completed_jobs') {
      orderBy = { freelancerProjects: { _count: 'desc' } }
    }

    const users = await prisma.user.findMany({
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        image: true,
        longest_streak: true,
        profile: { select: { xp: true, level: true } },
        _count: { select: { freelancerProjects: true } },
      },
    })

    return users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      name: user.name,
      avatar: user.image || undefined,
      experience: user.profile?.xp || 0,
      level: user.profile?.level || 1,
      streak: user.longest_streak || 0,
      completedJobs: user._count.freelancerProjects,
    }))
  }
}
