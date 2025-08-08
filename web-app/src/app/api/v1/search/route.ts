import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { IntelligentSearchService, SearchFilters } from '@/lib/search'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)

    // Parse search filters from query parameters
    const filters: SearchFilters = {
      query: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      skills: searchParams.get('skills')?.split(',').filter(Boolean) || undefined,
      budgetMin: searchParams.get('budgetMin') ? parseInt(searchParams.get('budgetMin')!) : undefined,
      budgetMax: searchParams.get('budgetMax') ? parseInt(searchParams.get('budgetMax')!) : undefined,
      difficulty: searchParams.get('difficulty') as any || undefined,
      location: searchParams.get('location') || undefined,
      projectType: searchParams.get('projectType') as any || undefined,
      deadline: searchParams.get('deadline') as any || undefined,
      clientRating: searchParams.get('clientRating') ? parseFloat(searchParams.get('clientRating')!) : undefined,
      verified: searchParams.get('verified') === 'true',
      sortBy: searchParams.get('sortBy') as any || 'relevance',
      sortOrder: searchParams.get('sortOrder') as any || 'desc'
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const results = await IntelligentSearchService.searchProjects(
      filters,
      session?.user?.id,
      page,
      limit
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { type = 'projects', ...filters } = body

    let results

    switch (type) {
      case 'semantic':
        results = await IntelligentSearchService.semanticSearch(
          filters.query,
          filters.searchType || 'projects',
          filters.limit || 20
        )
        break
      
      case 'recommendations':
        if (!session?.user?.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        results = await IntelligentSearchService.getPersonalizedRecommendations(
          session.user.id,
          filters.recommendationType || 'projects',
          filters.limit || 10
        )
        break
      
      default:
        results = await IntelligentSearchService.searchProjects(
          filters,
          session?.user?.id,
          filters.page || 1,
          filters.limit || 20
        )
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
