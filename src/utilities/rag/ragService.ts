import Groq from "groq-sdk";
import { prisma } from "@/prisma/client";
import { getBgeEmbedding, getClipTextEmbedding } from "./embeddingService";

const groqApiKey = process.env.GROQ_API_KEY as string;

if (!groqApiKey) {
  // eslint-disable-next-line no-console
  console.warn("GROQ_API_KEY is not set. Generation will fail.");
}

const groq = new Groq({ apiKey: groqApiKey });

type MatchedText = { id: string; tweet_id: string | null; content: string; distance: number };
type MatchedImage = { id: string; tweet_id: string | null; image_url: string; distance: number };

export async function getRagResponse(userQuery: string): Promise<string> {
  // 1) Encode query in both spaces
  const [bgeQuery, clipTextQuery] = await Promise.all([
    getBgeEmbedding(userQuery),
    getClipTextEmbedding(userQuery),
  ]);

  // 2) Retrieve
  const [texts, images] = await Promise.all([
    prisma.$queryRawUnsafe<MatchedText[]>(
      `SELECT * FROM public.match_tweets_by_text($1::vector, $2::int)` as any,
      JSON.stringify(bgeQuery),
      3
    ),
    prisma.$queryRawUnsafe<MatchedImage[]>(
      `SELECT * FROM public.match_images_by_text($1::vector, $2::int)` as any,
      JSON.stringify(clipTextQuery),
      2
    ),
  ]);

  // 3) Build context
  const textContext = (texts || [])
    .map((t, i) => `Text#${i + 1}: ${t.content}`)
    .join("\n");
  const imageContext = (images || [])
    .map((im, i) => `Image#${i + 1}: ${im.image_url}`)
    .join("\n");

  const context = [textContext, imageContext].filter(Boolean).join("\n\n");

  const augmentedPrompt = `You are a helpful assistant. Use the following retrieved context to answer the user's question accurately.
\nRetrieved Context:\n${context || "(no context found)"}\n\nUser Question: ${userQuery}\n\nAnswer:`;

  // 4) Generate with Groq
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You answer concisely and cite images by URL when helpful." },
      { role: "user", content: augmentedPrompt },
    ],
    temperature: 0.2,
    max_tokens: 512,
  });

  const answer = completion.choices?.[0]?.message?.content || "";
  return answer.trim();
}


