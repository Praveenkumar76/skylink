import React from "react";
import { usePathname } from "next/navigation";
import Cookies from "universal-cookie";

import { verifyJwtToken } from "@/utilities/auth";
import { VerifiedToken } from "@/types/TokenProps";

const fromServer = async () => {
    const cookies = require("next/headers").cookies;
    const cookieList = cookies();
    const { value: token } = cookieList.get("token") ?? { value: null };
    const verifiedToken = token && (await verifyJwtToken(token));
    return verifiedToken;
};

export default function useAuth() {
    const [token, setToken] = React.useState<VerifiedToken>(null);
    const [isPending, setIsPending] = React.useState<boolean>(true);
    const pathname = usePathname();

    const getVerifiedToken = async () => {
        setIsPending(true);
        const cookies = new Cookies();
        const token = cookies.get("token") ?? null;
        const verifiedToken = token && (await verifyJwtToken(token));
        setToken(verifiedToken);
        setIsPending(false);
    };

    const refreshToken = async () => {
        const cookies = new Cookies();
        const token = cookies.get("token") ?? null;
        const verifiedToken = token && (await verifyJwtToken(token));
        setToken(verifiedToken);
    };

    // Force refresh function that can be called after login
    const forceRefresh = async () => {
        await getVerifiedToken();
    };

    // Manual refresh that doesn't set loading state
    const manualRefresh = async () => {
        const cookies = new Cookies();
        const token = cookies.get("token") ?? null;
        const verifiedToken = token && (await verifyJwtToken(token));
        setToken(verifiedToken);
    };

    // Initial token verification
    React.useEffect(() => {
        getVerifiedToken();
    }, []);

    // Refresh auth state on route changes (but only if we don't have a token)
    React.useEffect(() => {
        if (!isPending && !token) {
            // Small delay to ensure any cookies are properly set
            const timer = setTimeout(() => {
                refreshToken();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [pathname, isPending, token]);

    return { token, isPending, refreshToken, forceRefresh, manualRefresh };
}

useAuth.fromServer = fromServer;

// Custom hook for authorization which works with server (fromServer) and client side

