import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { paymentSchema } from '@/lib/validators';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth(['OWNER', 'STAFF']);

    const transaction = await prisma.transaction.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
      include: {
        items: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    const body = await request.json();
    const validation = paymentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { amount, paymentType, paymentMethod, notes } = validation.data;

    if (amount > transaction.remainingAmount) {
      return NextResponse.json(
        { success: false, error: `Jumlah pembayaran melebihi sisa tagihan (Maksimal Rp ${transaction.remainingAmount.toLocaleString('id-ID')})` },
        { status: 400 }
      );
    }

    const newPaidAmount = transaction.paidAmount + amount;
    const newRemainingAmount = transaction.totalAmount - newPaidAmount;
    const newPaymentStatus = newRemainingAmount <= 0 ? 'FULLY_PAID' : 'DP_PAID';

    const updatedPayment = await prisma.$transaction(async (tx) => {
      // 1. Record payment
      const payment = await tx.payment.create({
        data: {
          transactionId: id,
          amount,
          paymentType,
          paymentMethod,
          notes,
        },
      });

      // 2. Update transaction
      await tx.transaction.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          paymentStatus: newPaymentStatus,
        },
      });

      // 3. If fully paid, update all animal statuses to SOLD
      if (newPaymentStatus === 'FULLY_PAID') {
        const animalIds = transaction.items.map((item) => item.animalId);
        await tx.animal.updateMany({
          where: {
            id: { in: animalIds },
            tenantId: user.tenantId,
          },
          data: {
            status: 'SOLD',
          },
        });

        // Trigger notification that transaction has been fully paid
        await tx.notification.create({
          data: {
            tenantId: user.tenantId,
            userId: user.userId,
            transactionId: id,
            type: 'PURCHASE_CONFIRMATION',
            title: 'Pembayaran Lunas',
            message: `Transaksi ${transaction.invoiceNumber} telah dilunasi sebesar Rp ${amount.toLocaleString('id-ID')}`,
          },
        });
      }

      return payment;
    });

    return NextResponse.json({ success: true, data: updatedPayment });
  } catch (error: any) {
    console.error('POST Payment Error:', error);
    const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server' }, { status });
  }
}
