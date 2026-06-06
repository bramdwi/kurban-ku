import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { setAuthCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { tenantName, name, email, password, phone, address } = validation.data;

    // Check if email already exists globally or for this specific context
    // For simple SaaS, email should be globally unique to prevent confusion, or unique per tenant.
    // Let's enforce global unique email for logins to work seamlessly.
    const existingUser = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Generate slug from tenantName
    let slug = tenantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!slug) {
      slug = 'usaha-' + Math.random().toString(36).substring(2, 7);
    }

    // Check if slug is unique, if not append random string
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create Tenant and Owner in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug,
          ownerName: name,
          phone,
          address,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name,
          email,
          passwordHash,
          role: 'OWNER',
        },
      });

      return { tenant, user };
    });

    // Set auth cookie
    const payload = {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role as any,
      name: result.user.name,
      tenantId: result.tenant.id,
      tenantName: result.tenant.name,
    };

    await setAuthCookie(payload);

    return NextResponse.json({
      success: true,
      data: payload,
    });
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
