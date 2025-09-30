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
  // Fast path: handle common intent without external embeddings
  const lower = userQuery.toLowerCase();
  const wantsTrending = /(trending|top|most\s+liked|popular)/.test(lower);
  if (wantsTrending) {
    try {
      const top = await prisma.tweet.findMany({
        where: { isReply: false },
        include: {
          author: { select: { username: true, name: true } },
          _count: { select: { likedBy: true, retweetedBy: true } },
        },
        orderBy: [{ likedBy: { _count: "desc" } }, { createdAt: "desc" }],
        take: 5,
      });
      if ((top || []).length > 0) {
        const lines = top.map((t, i) => `${i + 1}. @${t.author.username}: ${t.text} (likes: ${t._count.likedBy}, shares: ${t._count.retweetedBy})`);
        return `Top posts right now:\n${lines.join("\n")}`;
      }
    } catch (e) {
      // ignore and fall through to generic answer
    }
  }

  // 1) Encode query in both spaces (best-effort)
  let bgeQuery: number[] | null = null;
  let clipTextQuery: number[] | null = null;
  try {
    [bgeQuery, clipTextQuery] = await Promise.all([
      getBgeEmbedding(userQuery).catch(() => null as any),
      getClipTextEmbedding(userQuery).catch(() => null as any),
    ]);
  } catch {
    // ignore
  }

  // 2) Retrieve (only if embeddings are available)
  let texts: MatchedText[] = [];
  let images: MatchedImage[] = [];
  try {
    if (bgeQuery) {
      texts = await prisma.$queryRawUnsafe<MatchedText[]>(
        `SELECT * FROM public.match_tweets_by_text($1::vector, $2::int)` as any,
        JSON.stringify(bgeQuery),
        3
      );
    }
    if (clipTextQuery) {
      images = await prisma.$queryRawUnsafe<MatchedImage[]>(
        `SELECT * FROM public.match_images_by_text($1::vector, $2::int)` as any,
        JSON.stringify(clipTextQuery),
        2
      );
    }
  } catch {
    // retrieval is optional
  }

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