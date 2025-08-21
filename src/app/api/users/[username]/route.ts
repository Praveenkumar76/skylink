import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function GET(request: NextRequest, context: { params: Promise<{ username: string }> }) {
    const { username } = await context.params;
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
            select: {
                id: true,
                name: true,
                username: true,
                createdAt: true,
                updatedAt: true,
                description: true,
                location: true,
                website: true,
                isPremium: true,
                photoUrl: true,
                headerUrl: true,
                // Corrected: Select the 'follower' relation from within the 'followers' (Follows) list.
                followers: {
                    select: {
                        follower: { // This gets you to the User model of the follower
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                photoUrl: true,
                            },
                        },
                    },
                },
                // Corrected: Select the 'following' relation from within the 'following' (Follows) list.
                following: {
                    select: {
                        following: { // This gets you to the User model of the person being followed
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                photoUrl: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
            },
        });
        return NextResponse.json({ success: true, user });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error });
    }
}