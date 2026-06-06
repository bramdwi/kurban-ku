import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { animalSchema } from '@/lib/validators';
import { handleApiError } from '@/lib/errors';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();

    const animal = await prisma.animal.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
      include: {
        animalType: true,
        photos: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!animal) {
      return NextResponse.json({ success: false, error: 'Hewan kurban tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: animal });
  } catch (error: any) {
    return handleApiError(error, 'GET Animal Detail');
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth(['OWNER', 'STAFF']);

    // Check if animal exists for this tenant
    const existingAnimal = await prisma.animal.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
    });

    if (!existingAnimal) {
      return NextResponse.json({ success: false, error: 'Hewan kurban tidak ditemukan' }, { status: 404 });
    }

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

    // 1. Re-evaluate Animal Type based on weight and tenant (only if species or weight changed)
    let animalTypeId = existingAnimal.animalTypeId;
    if (existingAnimal.weight !== weight || existingAnimal.species !== species) {
      const matchedType = await prisma.animalType.findFirst({
        where: {
          tenantId: user.tenantId,
          species,
          minWeight: { lte: weight },
          maxWeight: { gte: weight },
        },
      });
      animalTypeId = matchedType ? matchedType.id : null;
    }

    // 2. Perform Transactional update of animal and photos
    const updatedAnimal = await prisma.$transaction(async (tx) => {
      // If photoUrls are provided, clear old ones and write new ones
      if (photoUrls !== undefined) {
        await tx.animalPhoto.deleteMany({
          where: { animalId: id },
        });

        if (photoUrls.length > 0) {
          await tx.animalPhoto.createMany({
            data: photoUrls.map((url, idx) => ({
              animalId: id,
              photoUrl: url,
              sortOrder: idx,
            })),
          });
        }
      }

      return tx.animal.update({
        where: { id },
        data: {
          species,
          weight,
          purchasePrice,
          sellingPrice,
          status,
          description,
          animalTypeId,
        },
        include: {
          animalType: true,
          photos: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
    });

    return NextResponse.json({ success: true, data: updatedAnimal });
  } catch (error: any) {
    return handleApiError(error, 'PUT Animal');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth(['OWNER']);

    // Check if animal exists for this tenant
    const animal = await prisma.animal.findFirst({
      where: { id, tenantId: user.tenantId, deletedAt: null },
      include: {
        transactionItems: {
          include: {
            transaction: true,
          },
        },
      },
    });

    if (!animal) {
      return NextResponse.json({ success: false, error: 'Hewan kurban tidak ditemukan' }, { status: 404 });
    }

    // Safeguard: Do not delete sold/booked animals or those in active transactions
    if (animal.status === 'SOLD' || animal.status === 'BOOKED') {
      return NextResponse.json(
        { success: false, error: 'Tidak dapat menghapus hewan yang sudah terjual atau dipesan' },
        { status: 400 }
      );
    }

    const activeTxItems = animal.transactionItems.filter(
      (item) => item.transaction && item.transaction.status !== 'CANCELLED'
    );
    if (activeTxItems.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak dapat menghapus hewan yang terikat pada transaksi aktif' },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.animal.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: 'Hewan kurban berhasil dihapus' });
  } catch (error: any) {
    return handleApiError(error, 'DELETE Animal');
  }
}
