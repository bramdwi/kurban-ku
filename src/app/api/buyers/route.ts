import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { buyerSchema } from '@/lib/validators';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where: any = {
      tenantId: user.tenantId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: buyers });
  } catch (error: any) {
    return handleApiError(error, 'GET Buyers');
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['OWNER', 'STAFF']);

    const body = await request.json();
    const validation = buyerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, address, notes } = validation.data;

    const newBuyer = await prisma.buyer.create({
      data: {
        tenantId: user.tenantId,
        name,
        phone,
        address,
        notes,
      },
    });

    return NextResponse.json({ success: true, data: newBuyer });
  } catch (error: any) {
    return handleApiError(error, 'POST Buyers');
  }
}
