import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/v1/projects - Get all projects with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const search = searchParams.get('search');
    const clientId = searchParams.get('clientId');
    const freelancerId = searchParams.get('freelancerId');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (minBudget) where.budget = { ...where.budget, gte: parseFloat(minBudget) };
    if (maxBudget) where.budget = { ...where.budget, lte: parseFloat(maxBudget) };
    if (clientId) where.clientId = clientId;
    if (freelancerId) where.freelancerId = freelancerId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          budget: true,
          status: true,
          category: true,
          skills: true,
          deadline: true,
          createdAt: true,
          client: {
            select: {
              id: true,
              name: true,
              image: true,
              profile: {
                select: {
                  rating: true,
                  completedProjects: true
                }
              }
            }
          },
          freelancer: {
            select: {
              id: true,
              name: true,
              image: true,
              profile: {
                select: {
                  rating: true,
                  completedProjects: true
                }
              }
            }
          },
          applications: {
            select: {
              id: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.project.count({ where })
    ]);

    return NextResponse.json({
      projects: projects.map(project => ({
        ...project,
        applicationsCount: project.applications.length,
        applications: undefined
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/projects - Create new project
const createProjectSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  budget: z.number().positive(),
  category: z.string(),
  skills: z.array(z.string()).min(1),
  deadline: z.string().datetime().optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only clients can create projects
    if (session.user.role !== 'CLIENT' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only clients can create projects' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
        clientId: session.user.id,
        status: 'OPEN'
      },
      select: {
        id: true,
        title: true,
        description: true,
        budget: true,
        status: true,
        category: true,
        skills: true,
        deadline: true,
        createdAt: true,
        client: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
