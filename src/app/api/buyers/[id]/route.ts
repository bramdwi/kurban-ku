import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { buyerSchema } from '@/lib/validators';
import { handleApiError } from '@/lib/errors';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();

    const buyer = await prisma.buyer.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
      include: {
        transactions: {
          where: { tenantId: user.tenantId, deletedAt: null },
          orderBy: { transactionDate: 'desc' },
        },
      },
    });

    if (!buyer) {
      return NextResponse.json({ success: false, error: 'Pembeli tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: buyer });
  } catch (error: any) {
    return handleApiError(error, 'GET Buyer Detail');
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth(['OWNER', 'STAFF']);

    const buyer = await prisma.buyer.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
    });

    if (!buyer) {
      return NextResponse.json({ success: false, error: 'Pembeli tidak ditemukan' }, { status: 404 });
    }

    const body = await request.json();
    const validation = buyerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, address, notes } = validation.data;

    const updatedBuyer = await prisma.buyer.update({
      where: { id },
      data: {
        name,
        phone,
        address,
        notes,
      },
    });

    return NextResponse.json({ success: true, data: updatedBuyer });
  } catch (error: any) {
    return handleApiError(error, 'PUT Buyer');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth(['OWNER']);

    const buyer = await prisma.buyer.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
      include: {
        transactions: {
          where: { tenantId: user.tenantId, deletedAt: null },
        },
      },
    });

    if (!buyer) {
      return NextResponse.json({ success: false, error: 'Pembeli tidak ditemukan' }, { status: 404 });
    }

    // Safeguard: Check if they have transactions
    if (buyer.transactions.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak dapat menghapus pembeli yang memiliki riwayat transaksi' },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.buyer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: 'Pembeli berhasil dihapus' });
  } catch (error: any) {
    return handleApiError(error, 'DELETE Buyer');
  }
}
