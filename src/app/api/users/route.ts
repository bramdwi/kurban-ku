import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { userSchema } from '@/lib/validators';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || '';
    const search = searchParams.get('search') || '';

    const where: any = { tenantId: user.tenantId, deletedAt: null };
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error('GET Users Error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server' }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await requireAuth(['OWNER']);

    const body = await request.json();
    const validation = userSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password wajib diisi untuk user baru' }, { status: 400 });
    }

    // Check if email exists (emails must be globally unique so login routing works reliably)
    const existing = await prisma.user.findFirst({ where: { email, deletedAt: null } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        tenantId: authUser.tenantId,
        name,
        email,
        passwordHash,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: newUser });
  } catch (error: any) {
    console.error('POST User Error:', error);
    const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server' }, { status });
  }
}
