import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwtToken, getJwtSecretKey } from '@/utilities/auth';
import { processUserRequest } from '@/services/agentService';
import { UserProps } from '@/types/UserProps';
import { prisma } from '@/prisma/client';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'Prompt is required and must be a string' },
                { status: 400 }
            );
        }

        // Get user authentication
        const token = (await cookies()).get("token")?.value;
        const verifiedToken: UserProps = token && (await verifyJwtToken(token));

        if (!verifiedToken) {
            return NextResponse.json(
                { error: 'You must be logged in to use the AI assistant' },
                { status: 401 }
            );
        }

        console.log('Processing user request with agent service...');

        // Use the agent service to process the request
        const response = await processUserRequest({
            prompt,
            userId: verifiedToken.id
        });

        // Refresh JWT so any profile changes are reflected in the client session
        try {
            const updatedUser = await prisma.user.findUnique({
                where: { id: verifiedToken.id },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    description: true,
                    location: true,
                    website: true,
                    isPremium: true,
                    createdAt: true,
                    photoUrl: true,
                    headerUrl: true,
                },
            });

            const res = NextResponse.json({ response });

            if (updatedUser) {
                const newToken = await new SignJWT({
                    id: updatedUser.id,
                    username: updatedUser.username,
                    name: updatedUser.name,
                    description: updatedUser.description,
                    location: updatedUser.location,
                    website: updatedUser.website,
                    isPremium: updatedUser.isPremium,
                    createdAt: updatedUser.createdAt,
                    photoUrl: updatedUser.photoUrl,
                    headerUrl: updatedUser.headerUrl,
                })
                    .setProtectedHeader({ alg: 'HS256' })
                    .setIssuedAt()
                    .setExpirationTime('1d')
                    .sign(getJwtSecretKey());

                res.cookies.set({ name: 'token', value: newToken, path: '/' });
            }

            return res;
        } catch {
            // If refresh fails, still return the agent response
            return NextResponse.json({ response });
        }

    } catch (error) {
        console.error('Error in chatbot API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
