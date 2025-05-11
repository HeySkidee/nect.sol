import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { creatorPublicKey } = await req.json();
    if (!creatorPublicKey) {
      console.warn('Analytics request missing creatorPublicKey');
      return NextResponse.json({ error: 'Creator public key is required' }, { status: 400 });
    }

    // Get creator's user record
    const creator = await prisma.user.findUnique({
      where: { publicKey: creatorPublicKey },
    });

    if (!creator) {
      console.warn(`Creator not found for publicKey: ${creatorPublicKey}`);
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all completed purchases for the creator's products
    const purchases = await prisma.purchase.findMany({
      where: {
        product: {
          creatorId: creator.id
        },
        status: 'COMPLETED'
      },
      include: {
        product: true
      }
    });

    // Calculate revenue metrics
    const totalRevenue = purchases.reduce((sum, p) => sum + p.product.price, 0);
    const todayRevenue = purchases
      .filter(p => p.createdAt >= today)
      .reduce((sum, p) => sum + p.product.price, 0);

    // Calculate sales metrics
    const totalSales = purchases.length;
    const todaySales = purchases.filter(p => p.createdAt >= today).length;

    // Get all products with their sales data
    const products = await prisma.product.findMany({
      where: { creatorId: creator.id },
      include: {
        purchases: {
          where: { status: 'COMPLETED' }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate product metrics
    const productList = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      sales: product.purchases.length,
      revenue: product.purchases.length * product.price,
      releaseDate: product.createdAt.toISOString(),
      visibility: product.visibility,
      category: product.category,
      fileType: product.fileType,
      bannerUrl: product.bannerUrl,
      isPublic: product.visibility === 'PUBLIC'
    }));

    // Get unique customers and returning customers
    const allBuyers = purchases.map(p => p.buyer);
    const uniqueBuyers = new Set(allBuyers);
    const returningBuyers = new Set(
      allBuyers.filter(buyer => 
        allBuyers.filter(b => b === buyer).length > 1
      )
    );

    // Get download metrics
    const totalDownloads = await prisma.purchase.count({
      where: {
        product: { creatorId: creator.id },
        status: 'DOWNLOADED'
      }
    });

    const pendingDownloads = await prisma.purchase.count({
      where: {
        product: { creatorId: creator.id },
        status: 'COMPLETED',
        NOT: { status: 'DOWNLOADED' }
      }
    });

    return NextResponse.json({
      revenue: {
        total: totalRevenue,
        today: todayRevenue
      },
      sales: {
        total: totalSales,
        today: todaySales
      },
      products: {
        total: products.length,
        topSelling: productList.sort((a, b) => b.sales - a.sales).slice(0, 5),
        allProducts: productList
      },
      customers: {
        total: uniqueBuyers.size,
        returning: returningBuyers.size
      },
      downloads: {
        total: totalDownloads,
        pending: pendingDownloads
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error instanceof Error ? error.message : 'Unknown error'
      : 'Failed to fetch analytics';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 