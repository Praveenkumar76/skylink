import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'Prompt is required and must be a string' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GROQ_API_KEY;
        
        if (!apiKey) {
            console.error('GROQ_API_KEY environment variable is not set');
            return NextResponse.json(
                { error: 'Chatbot service is not configured - GROQ_API_KEY missing' },
                { status: 500 }
            );
        }

        console.log('API Key found, making request to Groq...');

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
                            role: "system",
                            content: "You are the SkyLink AI assistant, a helpful AI assistant for the Skylink social media platform. You help users with questions about Skylink features, provide general assistance, and answer queries in a friendly, helpful manner. Keep your responses concise and relevant."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    model: "llama-3.1-8b-instant",
                    temperature: 0.7,
                    max_tokens: 1024,
                    top_p: 0.95,
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API request failed:', response.status, response.statusText, errorText);
            return NextResponse.json(
                { error: `Failed to get response from AI service: ${response.status} ${response.statusText}` },
                { status: 500 }
            );
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const botResponse = data.choices[0].message.content;
            return NextResponse.json({ response: botResponse });
        } else {
            console.error('Invalid response format from Groq API:', data);
            return NextResponse.json(
                { error: 'Invalid response from AI service' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in chatbot API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
