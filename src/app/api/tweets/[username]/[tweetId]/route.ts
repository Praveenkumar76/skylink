import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

// The context contains params for both username and tweetId from the URL structure.
export async function GET(request: NextRequest, context: { params: Promise<{ username: string; tweetId: string }> }) {
    const { tweetId } = await context.params;

    try {
        const tweet = await prisma.tweet.findUnique({
            where: {
                // Use the correctly destructured 'tweetId' variable here
                id: tweetId,
            },
            // The include block was already correct.
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
                        description: true,
                        photoUrl: true,
                        isPremium: true,
                    },
                },
                retweetedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        description: true,
                        photoUrl: true,
                        isPremium: true,
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
                        replies: {
                            select: {
                                authorId: true,
                            },
                        },
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
                replies: {
                    select: {
                        authorId: true,
                    },
                },
            },
        });
        return NextResponse.json({ success: true, tweet });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error });
    }
}