import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { prisma } from '@/prisma/client';
import { getJwtSecretKey, verifyJwtToken } from '@/utilities/auth';
import { UserProps } from '@/types/UserProps';
import { updateSkylinkProfile } from '@/services/actionService';

export async function POST(request: NextRequest) {
    try {
        const { updates } = await request.json();

        if (!updates || typeof updates !== 'object') {
            return NextResponse.json(
                { error: 'Updates object is required' },
                { status: 400 }
            );
        }

        const token = (await cookies()).get("token")?.value;
        const verifiedToken: UserProps = token && (await verifyJwtToken(token));

        if (!verifiedToken) {
            return NextResponse.json(
                { error: 'You are not authorized to perform this action.' },
                { status: 401 }
            );
        }

        // Use the agent service to update the profile
        const result = await updateSkylinkProfile({ 
            userId: verifiedToken.id, 
            updates 
        });

        // Get the updated user data to refresh the JWT token
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
            }
        });

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'User not found after update' },
                { status: 404 }
            );
        }

        // Create new JWT token with updated data
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
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1d")
            .sign(getJwtSecretKey());

        const response = NextResponse.json({
            success: true,
            message: result,
            updatedProfile: {
                name: updatedUser.name,
                description: updatedUser.description,
                location: updatedUser.location,
                website: updatedUser.website,
            }
        });

        // Set the new token in the response cookie
        response.cookies.set({
            name: "token",
            value: newToken,
            path: "/",
        });

        return response;

    } catch (error) {
        console.error('Error in agent profile update:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
