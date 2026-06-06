import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();

    const transaction = await prisma.transaction.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
      include: {
        buyer: true,
        creator: { select: { name: true } },
        items: {
          include: {
            animal: {
              include: {
                animalType: true,
                photos: true,
              },
            },
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        deliveries: {
          include: {
            driver: { select: { name: true } },
            photos: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error: any) {
    console.error('GET Transaction Detail Error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server' }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth(['OWNER']);

    // Check if transaction exists
    const transaction = await prisma.transaction.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
      include: {
        items: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    // Atomically cancel transaction and revert animals status back to AVAILABLE
    await prisma.$transaction(async (tx) => {
      // Revert animals
      const animalIds = transaction.items.map((item) => item.animalId);
      await tx.animal.updateMany({
        where: {
          id: { in: animalIds },
          tenantId: user.tenantId,
        },
        data: {
          status: 'AVAILABLE',
        },
      });

      // Update delivery status if exists
      await tx.delivery.updateMany({
        where: { transactionId: id, tenantId: user.tenantId },
        data: { status: 'FAILED', notes: 'Dibatalkan karena transaksi dibatalkan/dihapus' },
      });

      // Soft delete transaction
      await tx.transaction.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: 'CANCELLED',
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          transactionId: id,
          type: 'PURCHASE_CONFIRMATION',
          title: 'Transaksi Dibatalkan',
          message: `Transaksi ${transaction.invoiceNumber} telah dibatalkan. Status hewan dikembalikan ke Tersedia`,
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Transaksi berhasil dibatalkan dan dihapus' });
  } catch (error: any) {
    console.error('DELETE Transaction Error:', error);
    const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server' }, { status });
  }
}
