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

        // Fetch the file from UploadThing
        const fileResponse = await fetch(purchase.product.fileUrl);
        if (!fileResponse.ok) {
            throw new Error('Failed to fetch file');
        }

        // Get the content type from the response
        const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';
        
        // Create filename with extension from the stored fileType
        const fileName = `${purchase.product.name}.${purchase.product.fileType}`;

        // If it's a one-time download, invalidate the token
        if (purchase.product.oneTimeDownload) {
            await prisma.purchase.update({
                where: { id: purchase.id },
                data: { 
                    downloadToken: null,
                    status: 'DOWNLOADED'
                }
            });
        }

        // Stream the file to the client
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