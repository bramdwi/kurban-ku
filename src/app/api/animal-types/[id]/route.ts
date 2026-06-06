import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { animalTypeSchema } from '@/lib/validators';
import { handleApiError } from '@/lib/errors';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth(['OWNER', 'STAFF']);

    const body = await request.json();
    const validation = animalTypeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { species, typeName, minWeight, maxWeight, description } = validation.data;

    // Check if type exists and belongs to this tenant
    const existingType = await prisma.animalType.findUnique({
      where: { id },
    });

    if (!existingType || existingType.tenantId !== user.tenantId) {
      return NextResponse.json({ success: false, error: 'Tipe hewan tidak ditemukan' }, { status: 404 });
    }

    // Check unique name for the species and tenant (excluding current)
    const existingName = await prisma.animalType.findFirst({
      where: {
        id: { not: id },
        tenantId: user.tenantId,
        species,
        typeName: { equals: typeName },
      },
    });

    if (existingName) {
      return NextResponse.json(
        { success: false, error: `Tipe ${typeName} untuk jenis ${species} sudah terdaftar` },
        { status: 400 }
      );
    }

    // Weight range overlap validation per tenant (excluding current)
    const overlappingType = await prisma.animalType.findFirst({
      where: {
        species,
        tenantId: user.tenantId,
        id: { not: id },
        minWeight: { lte: maxWeight },
        maxWeight: { gte: minWeight },
      },
    });

    if (overlappingType) {
      return NextResponse.json(
        {
          success: false,
          error: `Rentang berat (${minWeight} - ${maxWeight} kg) bentrok dengan tipe "${overlappingType.typeName}" (${overlappingType.minWeight} - ${overlappingType.maxWeight} kg)`,
        },
        { status: 400 }
      );
    }

    const updatedType = await prisma.animalType.update({
      where: { id },
      data: {
        species,
        typeName,
        minWeight,
        maxWeight,
        description,
      },
    });

    return NextResponse.json({ success: true, data: updatedType });
  } catch (error: any) {
    return handleApiError(error, 'PUT Animal Type');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth(['OWNER']);

    // Check if type exists and belongs to this tenant
    const existingType = await prisma.animalType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { animals: true },
        },
      },
    });

    if (!existingType || existingType.tenantId !== user.tenantId) {
      return NextResponse.json({ success: false, error: 'Tipe hewan tidak ditemukan' }, { status: 404 });
    }

    // Check if there are animals associated with this type
    if (existingType._count.animals > 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak dapat menghapus tipe ini karena masih ada hewan yang menggunakannya' },
        { status: 400 }
      );
    }

    await prisma.animalType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Tipe hewan berhasil dihapus' });
  } catch (error: any) {
    return handleApiError(error, 'DELETE Animal Type');
  }
}
