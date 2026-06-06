import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    console.error('GET Delivery Error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server' }, { status });
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

    const delivery = await prisma.delivery.findUnique({ where: { id } });
    if (!delivery || delivery.tenantId !== user.tenantId) {
      return NextResponse.json({ success: false, error: 'Pengiriman tidak ditemukan' }, { status: 404 });
    }

    const updateData: any = {};

    if (body.status !== undefined) {
      updateData.status = body.status;
      // If delivered, set deliveredAt timestamp
      if (body.status === 'DELIVERED') {
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
      if (body.status === 'IN_TRANSIT') {
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

    if (body.driverId !== undefined) updateData.driverId = body.driverId || null;
    if (body.scheduledDate !== undefined) updateData.scheduledDate = body.scheduledDate ? new Date(body.scheduledDate) : null;
    if (body.deliveryAddress !== undefined) updateData.deliveryAddress = body.deliveryAddress;
    if (body.notes !== undefined) updateData.notes = body.notes;

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
    console.error('PATCH Delivery Error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server' }, { status });
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
    console.error('DELETE Delivery Error:', error);
    const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server' }, { status });
  }
}
