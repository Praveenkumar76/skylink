"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { getAllTweets } from "@/utilities/fetch";
import NewTweet from "@/components/tweet/NewTweet";
import Tweets from "@/components/tweet/Tweets";
import { AuthContext } from "../layout";
import CircularLoading from "@/components/misc/CircularLoading";

export default function ExplorePage() {
    const { token, isPending } = useContext(AuthContext);

    const { data, fetchNextPage, isLoading, hasNextPage } = useInfiniteQuery(
        {
            queryKey: ["tweets"],
            queryFn: async ({ pageParam = 1 }) => getAllTweets(pageParam.toString()),
            getNextPageParam: (lastResponse: any) => {
                if (lastResponse.nextPage > lastResponse.lastPage) return false;
                return lastResponse.nextPage;
            },
        } as any
    );

    const tweetsResponse = useMemo(
        () =>
            data?.pages.reduce((prev: any, page: any) => {
                return {
                    nextPage: page.nextPage,
                    tweets: [...(prev?.tweets || []), ...(page?.tweets || [])],
                };
            }, { tweets: [] }),
        [data]
    );

    if (isPending) return <CircularLoading />;

    return (
        <main>
            <h1 className="page-name">Explore</h1>
            {token && <NewTweet token={token} />}
            {isLoading ? (
                <CircularLoading />
            ) : (
                <InfiniteScroll
                    dataLength={tweetsResponse ? (tweetsResponse as any).tweets.length : 0}
                    next={() => fetchNextPage()}
                    hasMore={!!hasNextPage}
                    loader={<CircularLoading />}
                >
                    <Tweets tweets={tweetsResponse && (tweetsResponse as any).tweets} />
                </InfiniteScroll>
            )}
        </main>
    );
}
