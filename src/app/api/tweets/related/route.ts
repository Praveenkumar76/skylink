import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { UserProps } from "@/types/UserProps";

export async function GET(request: NextRequest) {
    const token = (await cookies()).get("token")?.value;
    const verifiedToken: UserProps | null = token ? await verifyJwtToken(token) : null;

    if (!verifiedToken)
        return NextResponse.json({ success: false, message: "You are not authorized to perform this action." });

    try {
        // Corrected: Use 'prisma.follows' which corresponds to the 'Follows' model.
        const followEdges = await prisma.follows.findMany({
            where: { followerId: verifiedToken.id },
            select: { followingId: true },
        });

        // Add the correct type to the parameter 'e'
        const followingUserIds = followEdges.map((e: { followingId: string }) => e.followingId);

        const tweets = await prisma.tweet.findMany({
            where: {
                OR: [
                    {
                        authorId: verifiedToken.id,
                    },
                    {
                        authorId: {
                            in: followingUserIds,
                        },
                    },
                ],
                isReply: false,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        isPremium: true,
                        photoUrl: true,
                        description: true,
                    },
                },
                likedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        isPremium: true,
                        photoUrl: true,
                        description: true,
                    },
                },
                retweetedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        isPremium: true,
                        photoUrl: true,
                        description: true,
                    },
                },
                retweetOf: {
                    select: {
                        id: true,
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                isPremium: true,
                                photoUrl: true,
                                description: true,
                            },
                        },
                        authorId: true,
                        createdAt: true,
                        likedBy: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                isPremium: true,
                                photoUrl: true,
                                description: true,
                            },
                        },
                        retweetedBy: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                isPremium: true,
                                photoUrl: true,
                                description: true,
                            },
                        },
                        photoUrl: true,
                        text: true,
                        isReply: true,
                        repliedTo: {
                            select: {
                                id: true,
                                author: {
                                    select: {
                                        id: true,
                                        username: true,
                                        name: true,
                                        isPremium: true,
                                        photoUrl: true,
                                        description: true,
                                    },
                                },
                            },
                        },
                        replies: {
                            select: {
                                authorId: true,
                            },
                        },
                    },
                },
                replies: {
                    select: {
                        id: true,
                    },
                },
                repliedTo: {
                    select: {
                        id: true,
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                isPremium: true,
                                photoUrl: true,
                                description: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                {
                    createdAt: "desc",
                },
            ],
        });
        return NextResponse.json({ success: true, tweets });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error });
    }
}
