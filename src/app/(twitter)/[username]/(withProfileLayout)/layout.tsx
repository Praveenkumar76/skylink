import Profile from "@/components/user/Profile";
import { prisma } from "@/prisma/client";
import NotFound from "@/components/misc/NotFound";

export default async function ProfileLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    const user = await prisma.user.findUnique({
        where: { username },
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
            followers: {
                select: {
                    followerId: true,
                    followingId: true,
                    follower: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            description: true,
                            location: true,
                            website: true,
                            isPremium: true,
                            createdAt: true,
                            updatedAt: true,
                            photoUrl: true,
                            headerUrl: true,
                        },
                    },
                },
            },
            following: {
                select: {
                    followerId: true,
                    followingId: true,
                    following: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            description: true,
                            location: true,
                            website: true,
                            isPremium: true,
                            createdAt: true,
                            updatedAt: true,
                            photoUrl: true,
                            headerUrl: true,
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

    if (!user) return <NotFound />;

    return (
        <div className="profile-layout">
            <Profile profile={user as any} />
            {children}
        </div>
    );
}
