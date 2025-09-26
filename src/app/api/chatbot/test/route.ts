import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        
        if (!apiKey) {
            return NextResponse.json(
                { error: 'GROQ_API_KEY environment variable is not set' },
                { status: 500 }
            );
        }

        // Test with a simple request
        const response = await fetch(
            `https://api.groq.com/openai/v1/chat/completions`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "user",
                            content: "Hello, this is a test message."
                        }
                    ],
                    model: "llama-3.1-8b-instant",
                    max_tokens: 50,
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { 
                    error: 'Groq API test failed', 
                    status: response.status, 
                    statusText: response.statusText,
                    details: errorText 
                },
                { status: 500 }
            );
        }

        const data = await response.json();
        return NextResponse.json({ 
            success: true, 
            message: 'Groq API is working correctly',
            response: data 
        });

    } catch (error) {
        console.error('Error in test route:', error);
        return NextResponse.json(
            { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
