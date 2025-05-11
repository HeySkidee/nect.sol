import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    const resolvedParams = await params;
    try {
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

        const fileResponse = await fetch(purchase.product.fileUrl);
        if (!fileResponse.ok) {
            throw new Error('Failed to fetch file');
        }

        const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';
        const fileName = `${purchase.product.name}.${purchase.product.fileType}`;

        // Handle one-time downloads
        if (purchase.product.oneTimeDownload) {
            await prisma.purchase.update({
                where: { id: purchase.id },
                data: { 
                    downloadToken: null,
                    status: 'DOWNLOADED'
                }
            });
        }

        return new NextResponse(fileResponse.body, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error("Error streaming file:", error);
        return NextResponse.json(
            { error: "Failed to stream file" },
            { status: 500 }
        );
    }
} 