import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { animalTypeSchema } from '@/lib/validators';
import { handleApiError } from '@/lib/errors';

export async function GET() {
  try {
    const user = await requireAuth();

    const types = await prisma.animalType.findMany({
      where: {
        tenantId: user.tenantId,
      },
      orderBy: [
        { species: 'asc' },
        { minWeight: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, data: types });
  } catch (error: any) {
    return handleApiError(error, 'GET Animal Types');
  }
}

export async function POST(request: Request) {
  try {
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

    // Check unique name for the species and tenant
    const existingName = await prisma.animalType.findFirst({
      where: {
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

    // Weight range overlap validation per tenant
    const overlappingType = await prisma.animalType.findFirst({
      where: {
        tenantId: user.tenantId,
        species,
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

    const newType = await prisma.animalType.create({
      data: {
        tenantId: user.tenantId,
        species,
        typeName,
        minWeight,
        maxWeight,
        description,
      },
    });

    return NextResponse.json({ success: true, data: newType });
  } catch (error: any) {
    return handleApiError(error, 'POST Animal Types');
  }
}
