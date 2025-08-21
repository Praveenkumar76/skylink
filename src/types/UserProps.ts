export type UserProps = {
    id: string;
    name: string;
    username: string;
    description: string;
    location: string;
    website: string;
    isPremium: boolean;
    createdAt: Date;
    updatedAt: Date;
    photoUrl: string;
    headerUrl: string;
};

export type UserCounts = {
    followers: number;
    following: number;
};

export type FollowEdge = {
    followerId: string;
    followingId: string;
    follower?: UserProps;
    following?: UserProps;
};

export type UserResponse = {
    success: boolean;
    user: any;
};

export type ProfileWithFollows = UserProps & {
    _count: UserCounts;
    followers: FollowEdge[];
    following: FollowEdge[];
};
