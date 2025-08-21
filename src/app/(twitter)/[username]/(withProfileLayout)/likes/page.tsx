import Tweets from "@/components/tweet/Tweets";
import NotFound from "@/components/misc/NotFound";
import NothingToShow from "@/components/misc/NothingToShow";
import { prisma } from "@/prisma/client";

export default async function LikesPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const tweets = await prisma.tweet.findMany({
        where: {
            likedBy: { some: { username } },
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
            replies: { select: { id: true } },
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
        orderBy: [{ createdAt: "desc" }],
    });

    if (!tweets) return <NotFound />;
    if (tweets.length === 0) return <NothingToShow />;

    return <Tweets tweets={tweets as any} />;
}
