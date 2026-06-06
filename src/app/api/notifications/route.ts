import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') || '';

    const where: any = {
      tenantId: user.tenantId,
    };

    // Owner sees all tenant notifications, others see own
    if (user.role !== 'OWNER') {
      where.userId = user.userId;
    }

    if (unreadOnly) where.isRead = false;
    if (type) where.type = type;

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        transaction: {
          select: { invoiceNumber: true, buyerId: true, buyer: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        ...where,
        isRead: false,
      },
    });

    return NextResponse.json({ success: true, data: { notifications, unreadCount } });
  } catch (error: any) {
    console.error('GET Notifications Error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server' }, { status });
  }
}

// Mark notifications as read
export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { notificationIds, markAllRead } = body;

    const where: any = { tenantId: user.tenantId, isRead: false };
    if (user.role !== 'OWNER') {
      where.userId = user.userId;
    }

    if (markAllRead) {
      await prisma.notification.updateMany({
        where,
        data: { isRead: true },
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          tenantId: user.tenantId,
        },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true, message: 'Notifikasi ditandai sudah dibaca' });
  } catch (error: any) {
    console.error('PATCH Notifications Error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server' }, { status });
  }
}
