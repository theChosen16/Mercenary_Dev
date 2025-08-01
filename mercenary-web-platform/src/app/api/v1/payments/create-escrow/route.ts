import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createEscrowPaymentIntent } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createEscrowSchema = z.object({
  projectId: z.string(),
  amount: z.number().min(500).max(100000000), // $5 to $1M
  description: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createEscrowSchema.parse(body);

    // Get project details and verify user is the client
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
      include: {
        client: true,
        freelancer: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Only project client can create escrow payment' }, { status: 403 });
    }

    if (!project.freelancerId) {
      return NextResponse.json({ error: 'Project must have assigned freelancer' }, { status: 400 });
    }

    // Create Stripe payment intent
    const { paymentIntent, fees } = await createEscrowPaymentIntent(
      validatedData.amount,
      validatedData.projectId,
      session.user.id,
      project.freelancerId,
      validatedData.description
    );

    // Save transaction record
    const transaction = await prisma.transaction.create({
      data: {
        amount: validatedData.amount,
        platformFee: fees.platformFee,
        stripeFee: fees.stripeFee,
        totalAmount: fees.clientTotal,
        status: 'PENDING',
        type: 'ESCROW',
        paymentIntentId: paymentIntent.id,
        clientId: session.user.id,
        freelancerId: project.freelancerId,
        projectId: validatedData.projectId,
        description: validatedData.description
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction.id,
      fees
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating escrow payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
