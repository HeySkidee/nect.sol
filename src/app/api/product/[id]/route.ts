import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                creator: true
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Get the current user's public key from cookies
        const cookieStore = await cookies();
        const currentUserPublicKey = cookieStore.get('publicKey')?.value;

        // If product is private, only allow access if the user is the creator
        if (product.visibility === 'PRIVATE') {
            if (!currentUserPublicKey || currentUserPublicKey !== product.creator.publicKey) {
                return NextResponse.json(
                    { error: "Product not found" },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        const data = await request.json();
        
        // Verify product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id },
            include: { creator: true }
        });

        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        const cookieStore = await cookies();
        const publicKey = cookieStore.get('publicKey')?.value;

        if (!publicKey || existingProduct.creator.publicKey !== publicKey) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Update product
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                category: data.category,
                visibility: data.visibility,
                isUnlimitedStock: data.isUnlimitedStock,
                stockQuantity: data.isUnlimitedStock ? null : parseInt(data.stockQuantity),
                oneTimeDownload: data.oneTimeDownload,
                bannerUrl: data.bannerUrl || null,
            },
            include: {
                creator: true
            }
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
} 