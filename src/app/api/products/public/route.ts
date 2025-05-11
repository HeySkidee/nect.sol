import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const publicProducts = await prisma.product.findMany({
      where: {
        visibility: 'PUBLIC'
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        fileType: true,
        category: true,
        bannerUrl: true,
        createdAt: true,
        creator: {
          select: {
            publicKey: true
          }
        }
      }
    });

    return NextResponse.json(publicProducts);
  } catch (error) {
    console.error('Failed to fetch public products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public products' },
      { status: 500 }
    );
  }
} 