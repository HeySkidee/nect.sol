import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        // 1. Get public key from request
        const { publicKey } = await request.json();
        
        if (!publicKey) {
            console.warn('User creation attempt without public key');
            return NextResponse.json(
                { error: "Public key is required" },
                { status: 400 }
            );
        }

        // Validate public key format (Solana public keys are base58 encoded)
        if (!/^[A-HJ-NP-Za-km-z1-9]*$/.test(publicKey)) {
            console.warn('Invalid public key format:', publicKey);
            return NextResponse.json(
                { error: "Invalid public key format" },
                { status: 400 }
            );
        }

        try {
            // Create or update user using upsert
            const user = await prisma.user.upsert({
                where: { publicKey },
                update: {}, // No updates needed, just want to ensure the user exists
                create: { publicKey }
            });

            console.log(user.id ? 'Existing user logged in:' : 'New user created:', publicKey);

            // Create response with appropriate message
            const response = NextResponse.json({ 
                message: user.id ? "User logged in" : "User created",
                publicKey 
            });

            // Set authentication cookie
            response.cookies.set({
                name: 'publicKey',
                value: publicKey,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 30 // 30 days
            });
            
            return response;
        } catch (dbError) {
            console.error('Database error handling user:', dbError);
            return NextResponse.json(
                { error: "Failed to process user" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in user route:', error);
        const errorMessage = process.env.NODE_ENV === 'development'
            ? error instanceof Error ? error.message : 'Unknown error'
            : 'Failed to process user request';

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
} 