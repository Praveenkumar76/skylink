"use client";

import { useContext } from "react";
import Link from "next/link";
import { useRef } from "react";

import { ThemeContext } from "@/app/providers";

export default function Logo() {
    const { theme } = useContext(ThemeContext);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // brief click animation
        const el = containerRef.current;
        if (el) {
            el.classList.add("logo-animate-click");
            setTimeout(() => el.classList.remove("logo-animate-click"), 250);
        }
        // dispatch event for chatbot to open
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("open-chatbot"));
        }
    };

    return (
        <div className="logo-link" role="button" tabIndex={0} onClick={handleClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e as unknown as React.MouseEvent); }}>
            {theme === "dark" ? (
                <video
                    className="logo-video"
                    width={80}
                    height={80}
                    autoPlay
                    loop
                    muted
                    playsInline
                    ref={(node) => { containerRef.current = node as unknown as HTMLDivElement | null; }}
                >
                    <source src="/assets/logo-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            ) : (
                <div className="logo-circle-container" ref={containerRef}>
                    <div className="logo-circle">
                        <div className="logo-circle-inner">
                            <img src="/assets/favicon.png" alt="logo" className="logo-img" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
