import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { deliverySchema } from '@/lib/validators';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const where: any = {
      tenantId: user.tenantId,
    };

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { transaction: { invoiceNumber: { contains: search } } },
        { transaction: { buyer: { name: { contains: search } } } },
        { deliveryAddress: { contains: search } },
      ];
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        transaction: {
          include: {
            buyer: true,
            items: {
              include: {
                animal: true,
              },
            },
          },
        },
        driver: { select: { id: true, name: true, email: true } },
        photos: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: deliveries });
  } catch (error: any) {
    return handleApiError(error, 'GET Deliveries');
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['OWNER', 'STAFF']);

    const body = await request.json();
    const validation = deliverySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { transactionId, driverId, scheduledDate, deliveryAddress, notes } = validation.data;

    // Verify transaction exists and belongs to this tenant
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, tenantId: user.tenantId },
      include: { buyer: true },
    });

    if (!transaction || transaction.deletedAt) {
      return NextResponse.json({ success: false, error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    const delivery = await prisma.delivery.create({
      data: {
        tenantId: user.tenantId,
        transactionId,
        driverId: driverId || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        deliveryAddress: deliveryAddress || transaction.buyer?.address || null,
        status: 'SCHEDULED',
        notes,
      },
      include: {
        transaction: { include: { buyer: true } },
        driver: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: delivery });
  } catch (error: any) {
    return handleApiError(error, 'POST Delivery');
  }
}
