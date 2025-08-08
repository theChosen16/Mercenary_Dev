import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { IntelligentSearchService } from '@/lib/search'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const matches = await IntelligentSearchService.findBestMatches(projectId, limit)

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Matching API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, freelancerId } = body

    if (!projectId || !freelancerId) {
      return NextResponse.json(
        { error: 'Project ID and Freelancer ID are required' },
        { status: 400 }
      )
    }

    // This would typically save a match recommendation or invitation
    // For now, we'll just return the matching score
    const matches = await IntelligentSearchService.findBestMatches(projectId, 50)
    const specificMatch = matches.find(m => m.freelancerId === freelancerId)

    if (!specificMatch) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    return NextResponse.json({ match: specificMatch })
  } catch (error) {
    console.error('Matching POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
