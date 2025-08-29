"use client";

import { useContext } from "react";
import Image from "next/image";
import { ThemeContext } from "@/app/providers";

export default function SkygenChatbotIcon() {
    const { theme } = useContext(ThemeContext);
    
    const iconSrc = theme === "dark" ? "/assets/favicon-white.png" : "/assets/favicon.png";
    
    return (
        <a 
            href="https://sky-gen.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="skygen-chatbot-icon"
            title="Skygen Chatbot"
        >
            <Image 
                src={iconSrc} 
                alt="Skygen Chatbot" 
                width={40} 
                height={40}
                className="skygen-icon"
            />
        </a>
    );
}