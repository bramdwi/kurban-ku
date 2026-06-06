import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { transactionSchema } from '@/lib/validators';
import { generateInvoiceNumber } from '@/lib/utils';
import { handleApiError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const search = searchParams.get('search') || '';

    const where: any = {
      tenantId: user.tenantId,
      deletedAt: null,
    };

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { buyer: { name: { contains: search } } },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        buyer: true,
        creator: { select: { name: true } },
        items: {
          include: {
            animal: true,
          },
        },
      },
      orderBy: { transactionDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    return handleApiError(error, 'GET Transactions');
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['OWNER', 'STAFF']);

    const body = await request.json();
    const validation = transactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { buyerId, animalIds, dpAmount = 0, notes } = validation.data;
    const paymentMethod = body.paymentMethod || 'CASH';

    // 1. Verify all animals exist, are AVAILABLE, and belong to the tenant
    const animals = await prisma.animal.findMany({
      where: {
        id: { in: animalIds },
        tenantId: user.tenantId,
        deletedAt: null,
      },
    });

    if (animals.length !== animalIds.length) {
      return NextResponse.json({ success: false, error: 'Beberapa hewan tidak ditemukan' }, { status: 400 });
    }

    const unavailableAnimals = animals.filter((a) => a.status !== 'AVAILABLE');
    if (unavailableAnimals.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Hewan berikut tidak tersedia: ${unavailableAnimals.map((a) => a.code).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Calculate totals
    const totalAmount = animals.reduce((sum, a) => sum + a.sellingPrice, 0);

    if (dpAmount > totalAmount) {
      return NextResponse.json({ success: false, error: 'DP tidak boleh melebihi total pembayaran' }, { status: 400 });
    }

    // Determine status values
    const remainingAmount = totalAmount - dpAmount;
    const paymentStatus = remainingAmount <= 0 ? 'FULLY_PAID' : dpAmount > 0 ? 'DP_PAID' : 'UNPAID';
    const status = 'CONFIRMED';
    const animalNewStatus = paymentStatus === 'FULLY_PAID' ? 'SOLD' : 'BOOKED';

    // 2. Generate Invoice Number (Unique for today per tenant)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayCount = await prisma.transaction.count({
      where: {
        tenantId: user.tenantId,
        transactionDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });
    const invoiceNumber = generateInvoiceNumber(todayCount + 1);

    // 3. Execute database operations atomically
    const dbTransaction = await prisma.$transaction(async (tx) => {
      // Create transaction
      const newTx = await tx.transaction.create({
        data: {
          tenantId: user.tenantId,
          invoiceNumber,
          buyerId,
          createdBy: user.userId,
          totalAmount,
          dpAmount,
          paidAmount: dpAmount,
          remainingAmount,
          paymentStatus,
          status,
          notes,
        },
        include: {
          buyer: true,
        },
      });

      // Create transaction items
      await tx.transactionItem.createMany({
        data: animals.map((a) => ({
          transactionId: newTx.id,
          animalId: a.id,
          price: a.sellingPrice,
        })),
      });

      // Update animal statuses
      await tx.animal.updateMany({
        where: {
          id: { in: animalIds },
          tenantId: user.tenantId,
        },
        data: {
          status: animalNewStatus,
        },
      });

      // Record initial payment if DP was paid
      if (dpAmount > 0) {
        await tx.payment.create({
          data: {
            transactionId: newTx.id,
            amount: dpAmount,
            paymentType: paymentStatus === 'FULLY_PAID' ? 'FULL_PAYMENT' : 'DP',
            paymentMethod,
            notes: paymentStatus === 'FULLY_PAID' ? 'Pembayaran lunas di awal' : 'Pembayaran DP',
          },
        });
      }

      // Automatically create a scheduled delivery
      await tx.delivery.create({
        data: {
          tenantId: user.tenantId,
          transactionId: newTx.id,
          deliveryAddress: newTx.buyer.address,
          status: 'SCHEDULED',
          notes: `Pengiriman otomatis untuk invoice ${invoiceNumber}`,
        },
      });

      // Create notification for transaction confirmation
      await tx.notification.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          transactionId: newTx.id,
          type: 'PURCHASE_CONFIRMATION',
          title: 'Transaksi Berhasil',
          message: `Transaksi ${invoiceNumber} senilai Rp ${totalAmount.toLocaleString('id-ID')} berhasil dibuat`,
        },
      });

      // If there's remaining debt, schedule a reminder notification
      if (remainingAmount > 0) {
        await tx.notification.create({
          data: {
            tenantId: user.tenantId,
            userId: user.userId,
            transactionId: newTx.id,
            type: 'PAYMENT_REMINDER',
            title: 'Tagihan Pelunasan',
            message: `Tagihan pelunasan untuk ${newTx.buyer.name} sebesar Rp ${remainingAmount.toLocaleString('id-ID')} dibuat`,
          },
        });
      }

      return newTx;
    });

    return NextResponse.json({ success: true, data: dbTransaction });
  } catch (error: any) {
    return handleApiError(error, 'POST Transaction');
  }
}
