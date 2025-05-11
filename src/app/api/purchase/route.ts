import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const publicKey = cookieStore.get('publicKey')?.value;

        if (!publicKey) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { productId, signature, amount } = await request.json();

        if (!productId || !signature || !amount) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Generate a unique download token
        const downloadToken = crypto.randomBytes(32).toString('hex');

        // Use a transaction to ensure both operations succeed or fail together
        const result = await prisma.$transaction(async (tx) => {
            // Get the product first to check stock
            const product = await tx.product.findUnique({
                where: { id: productId }
            });

            if (!product) {
                throw new Error('Product not found');
            }

            // Check if product has stock available
            if (!product.isUnlimitedStock && (product.stockQuantity === null || product.stockQuantity <= 0)) {
                throw new Error('Product out of stock');
            }

            // Update product stock if it's not unlimited
            if (!product.isUnlimitedStock && product.stockQuantity !== null) {
                await tx.product.update({
                    where: { id: productId },
                    data: {
                        stockQuantity: product.stockQuantity - 1
                    }
                });
            }

            // Create the purchase record
            const purchase = await tx.purchase.create({
                data: {
                    productId,
                    buyer: publicKey,
                    transactionSignature: signature,
                    status: 'COMPLETED',
                    downloadToken
                },
                include: {
                    product: true
                }
            });

            return purchase;
        });

        return NextResponse.json({
            ...result,
            downloadToken
        });
    } catch (error) {
        console.error("Error recording purchase:", error);
        const message = error instanceof Error ? error.message : "Failed to record purchase";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
} 