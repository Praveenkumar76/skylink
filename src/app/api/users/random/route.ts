import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function GET(request: NextRequest) {
    const token = (await cookies()).get("token")?.value;
    const verifiedToken: UserProps | null = token ? await verifyJwtToken(token) : null;

    if (!verifiedToken) return NextResponse.json({ success: false, message: "You are not logged in." });

    const currentUsername = verifiedToken.username;
    const currentUserId = verifiedToken.id;

    try {
        // First get the users that the current user is already following
        const followingEdges = await prisma.follows.findMany({
            where: { followerId: currentUserId },
            select: { followingId: true },
        });
        
        const followingUserIds = followingEdges.map((edge: { followingId: string }) => edge.followingId);

        const usersCount = await prisma.user.count({
            where: {
                isPremium: true,
                username: { not: currentUsername },
                photoUrl: { not: null },
                id: { notIn: followingUserIds },
            },
        });

        let skip = Math.floor(Math.random() * Math.max(usersCount - 3, 0));
        if (skip < 0) skip = 0;
        
        const users = await prisma.user.findMany({
            where: {
                isPremium: true,
                photoUrl: { not: null },
                username: { not: currentUsername },
                id: { notIn: followingUserIds },
            },
            select: {
                name: true,
                username: true,
                createdAt: true,
                description: true,
                photoUrl: true,
                isPremium: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
            },
            skip: skip,
            take: 3,
            orderBy: {
                createdAt: "desc",
            },
        });
        
        return NextResponse.json({ success: true, users });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error });
    }
}
