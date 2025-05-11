import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        // 1. Get public key from cookie for auth
        const cookieStore = await cookies();
        const publicKey = cookieStore.get('publicKey')?.value;
        
        if (!publicKey) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Find the user in database
        const user = await prisma.user.findUnique({
            where: { publicKey }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 401 });
        }

        // 3. Get product data from request
        const data = await request.json();

        // 4. Create product in database
        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                fileUrl: data.fileUrl,
                fileType: data.fileType,
                bannerUrl: data.bannerUrl || null,
                isUnlimitedStock: data.isUnlimitedStock,
                stockQuantity: data.isUnlimitedStock ? null : data.stockQuantity,
                category: data.category.toUpperCase(),
                visibility: data.visibility.toUpperCase(),
                oneTimeDownload: data.oneTimeDownload,
                uploadType: data.uploadType.toUpperCase(),
                creatorId: user.id
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
} 