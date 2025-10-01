"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { ThemeContext } from "@/app/providers";

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export default function Chatbot() {
    const { theme } = useContext(ThemeContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const chatWindowRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    // Focus input when chatbot opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    // Open via global event from Logo
    useEffect(() => {
        const openFromLogo = () => setIsOpen(true);
        if (typeof window !== "undefined") {
            window.addEventListener("open-chatbot", openFromLogo);
        }
        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("open-chatbot", openFromLogo);
            }
        };
    }, []);

    const addMessage = (text: string, isUser: boolean) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            isUser,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const getBotResponse = async (prompt: string): Promise<string> => {
        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.response) {
                return data.response;
            } else if (data.error) {
                throw new Error(data.error);
            } else {
                throw new Error("Invalid response format from API");
            }
        } catch (error) {
            console.error("Error getting bot response:", error);
            return "Sorry, I'm having trouble connecting right now. Please try again later.";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue("");
        addMessage(userMessage, true);
        setIsLoading(true);

        // Add typing indicator
        const typingMessage: Message = {
            id: "typing",
            text: "typing...",
            isUser: false,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, typingMessage]);

        try {
            const botResponse = await getBotResponse(userMessage);
            
            // Remove typing indicator and add actual response
            setMessages(prev => {
                const withoutTyping = prev.filter(msg => msg.id !== "typing");
                return [...withoutTyping, {
                    id: Date.now().toString(),
                    text: botResponse,
                    isUser: false,
                    timestamp: new Date(),
                }];
            });
        } catch (error) {
            // Remove typing indicator and add error message
            setMessages(prev => {
                const withoutTyping = prev.filter(msg => msg.id !== "typing");
                return [...withoutTyping, {
                    id: Date.now().toString(),
                    text: "Sorry, I encountered an error. Please try again.",
                    isUser: false,
                    timestamp: new Date(),
                }];
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chatbot Toggle Button (hidden if opened via Logo) */}
            {!isOpen && (
                <div 
                    id="chatbot-toggler" 
                    onClick={toggleChatbot}
                    className="chatbot-toggler"
                    title="Open Skylink Assistant"
                >
                    {theme === "dark" ? (
                        <video
                            className="chatbot-logo-video"
                            width={24}
                            height={24}
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
                        <img 
                            src="/assets/favicon.png" 
                            alt="AI Assistant" 
                            className="chatbot-logo"
                        />
                    )}
                </div>
            )}

            {/* Chatbot Container */}
            <div id="chatbot-container" className={`chatbot-container ${isOpen ? '' : 'hidden'}`}>
                {/* Background Video */}
                <video 
                    autoPlay 
                    muted 
                    loop 
                    id="bg-video"
                    className="chatbot-bg-video"
                >
                    <source src="/assets/logo-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Chatbot Header */}
                <div className="chatbot-header">
                    <span>SkyGen</span>
                    <button 
                        id="close-chatbot" 
                        onClick={toggleChatbot}
                        className="chatbot-close-btn"
                        title="Close SkyGen"
                    >
                        &times;
                    </button>
                </div>

                {/* Chat Window */}
                <div id="chat-window" ref={chatWindowRef} className="chatbot-window">
                    {messages.length === 0 && (
                        <div className="chatbot-welcome">
                            <p>👋 Hello! I&apos;m your SkyGen.</p>
                            <p>Ask me anything about SkyLink or get help with your questions!</p>
                        </div>
                    )}
                    {messages.map((message) => (
                        <div 
                            key={message.id} 
                            className={`chatbot-message ${message.isUser ? 'user' : 'bot'} ${message.id === 'typing' ? 'typing' : ''}`}
                        >
                            <div className="chatbot-message-content">
                                {message.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chat Form */}
                <form id="chat-form" onSubmit={handleSubmit} className="chatbot-form">
                    <input 
                        type="text" 
                        id="chat-input" 
                        ref={inputRef}
                        placeholder="Ask me anything..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        required 
                        disabled={isLoading}
                        className="chatbot-input"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !inputValue.trim()}
                        className="chatbot-send-btn"
                    >
                        Send
                    </button>
                </form>
            </div>
        </>
    );
}
