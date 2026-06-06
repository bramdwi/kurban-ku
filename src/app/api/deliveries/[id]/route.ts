import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { deliverySchema } from '@/lib/validators';
import { handleApiError } from '@/lib/errors';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        transaction: {
          include: {
            buyer: true,
            items: {
              include: {
                animal: {
                  include: { animalType: true },
                },
              },
            },
            payments: true,
          },
        },
        driver: { select: { id: true, name: true, email: true, role: true } },
        photos: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!delivery || delivery.tenantId !== user.tenantId) {
      return NextResponse.json({ success: false, error: 'Pengiriman tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: delivery });
  } catch (error: any) {
    return handleApiError(error, 'GET Delivery');
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const validation = deliverySchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    const validatedData = validation.data;

    const delivery = await prisma.delivery.findUnique({ where: { id } });
    if (!delivery || delivery.tenantId !== user.tenantId) {
      return NextResponse.json({ success: false, error: 'Pengiriman tidak ditemukan' }, { status: 404 });
    }

    const updateData: any = {};

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
      // If delivered, set deliveredAt timestamp
      if (validatedData.status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
        // Also update the transaction status to DELIVERED
        await prisma.transaction.update({
          where: { id: delivery.transactionId },
          data: { status: 'DELIVERED' },
        });
        // Create delivery notification
        await prisma.notification.create({
          data: {
            tenantId: user.tenantId,
            userId: user.userId,
            transactionId: delivery.transactionId,
            type: 'DELIVERY_UPDATE',
            title: 'Pengiriman Selesai',
            message: `Pengiriman untuk transaksi berhasil diselesaikan`,
          },
        });
      }
      if (validatedData.status === 'IN_TRANSIT') {
        await prisma.notification.create({
          data: {
            tenantId: user.tenantId,
            userId: user.userId,
            transactionId: delivery.transactionId,
            type: 'DELIVERY_UPDATE',
            title: 'Pengiriman Dalam Perjalanan',
            message: `Pengiriman sedang dalam perjalanan ke lokasi pembeli`,
          },
        });
      }
    }

    if (validatedData.driverId !== undefined) updateData.driverId = validatedData.driverId || null;
    if (validatedData.scheduledDate !== undefined) updateData.scheduledDate = validatedData.scheduledDate ? new Date(validatedData.scheduledDate) : null;
    if (validatedData.deliveryAddress !== undefined) updateData.deliveryAddress = validatedData.deliveryAddress;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    const updated = await prisma.delivery.update({
      where: { id },
      data: updateData,
      include: {
        transaction: { include: { buyer: true } },
        driver: { select: { id: true, name: true } },
        photos: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return handleApiError(error, 'PATCH Delivery');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(['OWNER']);
    const { id } = await params;

    const delivery = await prisma.delivery.findUnique({ where: { id } });
    if (!delivery || delivery.tenantId !== user.tenantId) {
      return NextResponse.json({ success: false, error: 'Pengiriman tidak ditemukan' }, { status: 404 });
    }

    await prisma.delivery.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Pengiriman berhasil dihapus' });
  } catch (error: any) {
    return handleApiError(error, 'DELETE Delivery');
  }
}
