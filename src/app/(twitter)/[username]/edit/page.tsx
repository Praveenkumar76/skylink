"use client";
import React, { useContext } from "react";
import { AuthContext } from "../../layout";
import CircularLoading from "@/components/misc/CircularLoading";
import EditProfile from "@/components/user/EditProfile";
import BackToArrow from "@/components/misc/BackToArrow";

export default function EditPage(props: any) {
    // In Next 15, route params are a Promise in client components. Use React.use() to unwrap.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { username }: { username: string } = (React as any).use(props.params);
    const { token, isPending, refreshToken } = useContext(AuthContext);

    if (isPending) return <CircularLoading />;

    if (!token) throw new Error("You must be logged in to view this page");
    if (username !== token.username) throw new Error("You are not authorized to view this page");

    return (
        <div>
            <BackToArrow title={username} url={`/${username}`} />
            <EditProfile profile={token} refreshToken={refreshToken} />
        </div>
    );
}