import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { IntelligentSearchService, SearchFilters } from '@/lib/search'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)

    // Parse and narrow enum-like filters from query parameters
    const difficultyParam = searchParams.get('difficulty')
    const difficulty: SearchFilters['difficulty'] =
      difficultyParam === 'beginner' ||
      difficultyParam === 'intermediate' ||
      difficultyParam === 'advanced'
        ? difficultyParam
        : undefined

    const projectTypeParam = searchParams.get('projectType')
    const projectType: SearchFilters['projectType'] =
      projectTypeParam === 'remote' ||
      projectTypeParam === 'onsite' ||
      projectTypeParam === 'hybrid'
        ? projectTypeParam
        : undefined

    const deadlineParam = searchParams.get('deadline')
    const deadline: SearchFilters['deadline'] =
      deadlineParam === 'urgent' ||
      deadlineParam === 'week' ||
      deadlineParam === 'month' ||
      deadlineParam === 'flexible'
        ? deadlineParam
        : undefined

    const sortByParam = searchParams.get('sortBy')
    const sortBy: SearchFilters['sortBy'] =
      sortByParam === 'relevance' ||
      sortByParam === 'budget' ||
      sortByParam === 'deadline' ||
      sortByParam === 'rating' ||
      sortByParam === 'recent'
        ? sortByParam
        : 'relevance'

    const sortOrderParam = searchParams.get('sortOrder')
    const sortOrder: SearchFilters['sortOrder'] =
      sortOrderParam === 'asc' || sortOrderParam === 'desc'
        ? sortOrderParam
        : 'desc'

    // Compose filters object
    const filters: SearchFilters = {
      query: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      skills:
        searchParams.get('skills')?.split(',').filter(Boolean) || undefined,
      budgetMin: searchParams.get('budgetMin')
        ? parseInt(searchParams.get('budgetMin')!)
        : undefined,
      budgetMax: searchParams.get('budgetMax')
        ? parseInt(searchParams.get('budgetMax')!)
        : undefined,
      difficulty,
      location: searchParams.get('location') || undefined,
      projectType,
      deadline,
      clientRating: searchParams.get('clientRating')
        ? parseFloat(searchParams.get('clientRating')!)
        : undefined,
      verified: searchParams.get('verified') === 'true',
      sortBy,
      sortOrder,
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
    const session = await auth()
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
