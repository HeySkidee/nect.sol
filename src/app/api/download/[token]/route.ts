import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    const resolvedParams = await params;
    try {
        // Find the purchase with the download token
        const purchase = await prisma.purchase.findFirst({
            where: {
                downloadToken: resolvedParams.token,
                status: 'COMPLETED'
            },
            include: {
                product: true
            }
        });

        if (!purchase) {
            return NextResponse.json(
                { error: "Invalid or expired download token" },
                { status: 404 }
            );
        }

        // Return only the metadata (not the actual file URL)
        return NextResponse.json({
            fileName: purchase.product.name,
            fileType: purchase.product.fileType
        });
    } catch (error) {
        console.error("Error processing download:", error);
        return NextResponse.json(
            { error: "Failed to process download" },
            { status: 500 }
        );
    }
} 