import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { animalSchema } from '@/lib/validators';
import { generateAnimalCode } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const species = searchParams.get('species') || '';
    const status = searchParams.get('status') || '';
    const animalTypeId = searchParams.get('animalTypeId') || '';
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    // Filters
    const where: any = {
      tenantId: user.tenantId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (species) {
      where.species = species;
    }

    if (status) {
      where.status = status;
    }

    if (animalTypeId) {
      where.animalTypeId = animalTypeId;
    }

    // Query DB
    const [animals, total] = await Promise.all([
      prisma.animal.findMany({
        where,
        include: {
          animalType: true,
          photos: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { code: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.animal.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: animals,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    console.error('GET Animals Error:', error);
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server' }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['OWNER', 'STAFF']);

    const body = await request.json();
    const validation = animalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { species, weight, purchasePrice, sellingPrice, status, description } = validation.data;
    const photoUrls = body.photoUrls as string[] | undefined;

    // 1. Auto-assign Animal Type based on Weight and Tenant
    const matchedType = await prisma.animalType.findFirst({
      where: {
        tenantId: user.tenantId,
        species,
        minWeight: { lte: weight },
        maxWeight: { gte: weight },
      },
    });

    // 2. Auto-generate Animal Code (increment from highest index of same species and tenant)
    const prefix = species === 'SAPI' ? 'SP' : species === 'KAMBING' ? 'KM' : 'DM';
    const lastAnimal = await prisma.animal.findFirst({
      where: {
        tenantId: user.tenantId,
        species,
        code: { startsWith: `KRB-${prefix}-` },
      },
      orderBy: { code: 'desc' },
    });

    let nextSeq = 1;
    if (lastAnimal) {
      const match = lastAnimal.code.match(/\d+$/);
      if (match) {
        nextSeq = parseInt(match[0], 10) + 1;
      }
    }
    const code = generateAnimalCode(species, nextSeq);

    // 3. Create Animal record
    const newAnimal = await prisma.animal.create({
      data: {
        tenantId: user.tenantId,
        code,
        species,
        weight,
        purchasePrice,
        sellingPrice,
        status,
        description,
        animalTypeId: matchedType?.id || null,
        photos: photoUrls && photoUrls.length > 0 ? {
          createMany: {
            data: photoUrls.map((url, idx) => ({
              photoUrl: url,
              sortOrder: idx,
            })),
          },
        } : undefined,
      },
      include: {
        animalType: true,
        photos: true,
      },
    });

    return NextResponse.json({ success: true, data: newAnimal });
  } catch (error: any) {
    console.error('POST Animals Error:', error);
    const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server' }, { status });
  }
}
