import NotFound from "@/components/misc/NotFound";
import BackToArrow from "@/components/misc/BackToArrow";
import SingleTweet from "@/components/tweet/SingleTweet";
import { prisma } from "@/prisma/client";
import { verifyJwtToken } from "@/utilities/auth";
import { cookies } from "next/headers";

export default async function SingleTweetPage({ params }: { params: Promise<{ username: string; tweetId: string }> }) {
    const { username, tweetId } = await params;

    const tokenCookie = (await cookies()).get("token")?.value;
    const token = tokenCookie ? await verifyJwtToken(tokenCookie) : null;

    const data = await prisma.tweet.findUnique({
        where: { id: tweetId },
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
            likedBy: { select: { id: true, username: true, name: true, isPremium: true, photoUrl: true, description: true } },
            retweetedBy: { select: { id: true, username: true, name: true, isPremium: true, photoUrl: true, description: true } },
            retweetOf: {
                select: {
                    id: true,
                    author: { select: { id: true, username: true, name: true, isPremium: true, photoUrl: true, description: true } },
                    authorId: true,
                    createdAt: true,
                    likedBy: { select: { id: true, username: true, name: true, isPremium: true, photoUrl: true, description: true } },
                    retweetedBy: { select: { id: true, username: true, name: true, isPremium: true, photoUrl: true, description: true } },
                    photoUrl: true,
                    text: true,
                    isReply: true,
                    repliedTo: { select: { id: true, author: { select: { id: true, username: true, name: true, isPremium: true, photoUrl: true, description: true } } } },
                    replies: { select: { authorId: true } },
                },
            },
            replies: { select: { id: true } },
            repliedTo: { select: { id: true, author: { select: { id: true, username: true, name: true, isPremium: true, photoUrl: true, description: true } } } },
        },
    });

    if (!data) return <NotFound />;

    let backToProps = { title: username, url: `/${username}` } as { title: string; url: string };
    if (data?.isReply && data.repliedTo) {
        backToProps = { title: "Tweet", url: `/${data.repliedTo.author.username}/tweets/${data.repliedTo.id}` };
    }

    return (
        <div>
            <BackToArrow title={backToProps.title} url={backToProps.url} />
            <SingleTweet tweet={data as any} token={token as any} />
        </div>
    );
}
