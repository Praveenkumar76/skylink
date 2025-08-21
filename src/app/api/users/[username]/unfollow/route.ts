import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function POST(request: NextRequest, context: { params: Promise<{ username: string }> }) {
    const { username } = await context.params;
    const tokenOwnerId = await request.json();

    const token = (await cookies()).get("token")?.value;
    const verifiedToken: UserProps = token && (await verifyJwtToken(token));

    if (!verifiedToken)
        return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });

    if (verifiedToken.id !== tokenOwnerId)
        return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });

    try {
        const followedUser = await prisma.user.findUnique({ where: { username } });
        if (!followedUser) {
            return NextResponse.json({ success: false, message: "User not found." });
        }

        await prisma.follows.delete({
            where: {
                followerId_followingId: {
                    followerId: tokenOwnerId,
                    followingId: followedUser.id,
                },
            },
        });
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error });
    }
}
