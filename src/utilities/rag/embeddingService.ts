import { prisma } from "@/prisma/client";

const HF_API_URL = "https://api-inference.huggingface.co";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY as string;

if (!HF_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn("HUGGINGFACE_API_KEY is not set. Embedding calls will fail.");
}

async function postFeatureExtraction(model: string, body: BodyInit, contentType?: string): Promise<number[] | number[][]> {
  const res = await fetch(`${HF_API_URL}/pipeline/feature-extraction/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      ...(contentType ? { "Content-Type": contentType } : {}),
    },
    body,
    // Cloud inference models may cold-start; wait for model avoids 503s
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HF feature-extraction failed (${model}): ${res.status} ${text}`);
  }
  const json = await res.json();
  return json as number[] | number[][];
}

function meanPoolEmbedding(output: number[] | number[][]): number[] {
  if (Array.isArray(output) && output.length > 0 && Array.isArray(output[0])) {
    const seq = output as number[][];
    const dim = seq[0].length;
    const sum = new Array(dim).fill(0);
    for (const token of seq) {
      for (let i = 0; i < dim; i++) sum[i] += token[i];
    }
    return sum.map((v) => v / seq.length);
  }
  return output as number[];
}

export async function getBgeEmbedding(text: string): Promise<number[]> {
  const model = "BAAI/bge-small-en-v1.5"; // 384 dims
  const prefixed = `query: ${text}`;
  const payload = JSON.stringify({ inputs: prefixed, options: { wait_for_model: true } });
  const output = await postFeatureExtraction(model, payload, "application/json");
  const embedding = meanPoolEmbedding(output);
  if (embedding.length !== 384) {
    throw new Error(`BGE embedding unexpected dimension: ${embedding.length}`);
  }
  return embedding;
}

export async function getClipTextEmbedding(text: string): Promise<number[]> {
  const model = "openai/clip-vit-large-patch14"; // 768 dims
  const payload = JSON.stringify({ inputs: text, options: { wait_for_model: true } });
  const output = await postFeatureExtraction(model, payload, "application/json");
  const embedding = meanPoolEmbedding(output);
  if (embedding.length !== 768) {
    throw new Error(`CLIP text embedding unexpected dimension: ${embedding.length}`);
  }
  return embedding;
}

export async function getClipImageEmbedding(imageUrl: string): Promise<number[]> {
  const model = "openai/clip-vit-large-patch14"; // 768 dims
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    throw new Error(`Failed to fetch image: ${imageUrl} (${imgRes.status})`);
  }
  const imgBuffer = await imgRes.arrayBuffer();
  const output = await postFeatureExtraction(model, imgBuffer, "application/octet-stream");
  const embedding = meanPoolEmbedding(output);
  if (embedding.length !== 768) {
    throw new Error(`CLIP image embedding unexpected dimension: ${embedding.length}`);
  }
  return embedding;
}

export type CreateEmbeddingParams = {
  text: string;
  imageUrl?: string;
  tweetId?: string | null;
};

export async function createAndStoreEmbeddings(params: CreateEmbeddingParams) {
  const { text, imageUrl, tweetId = null } = params;

  // If HF key is missing, skip embeddings entirely without failing the caller
  if (!HF_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn("Skipping embeddings: HUGGINGFACE_API_KEY not set");
    return { bgeEmbedding: null, clipTextEmbedding: null, clipImageEmbedding: null } as any;
  }

  let bge: number[] | null = null;
  let clipText: number[] | null = null;
  let clipImage: number[] | null = null;

  try {
    bge = await getBgeEmbedding(text);
  } catch (e) {
    console.error("BGE embedding failed", e);
  }
  try {
    clipText = await getClipTextEmbedding(text);
  } catch (e) {
    console.error("CLIP text embedding failed", e);
  }
  if (imageUrl) {
    try {
      clipImage = await getClipImageEmbedding(imageUrl);
    } catch (e) {
      console.error("CLIP image embedding failed", e);
    }
  }

  // Store available embeddings (best-effort)
  if (bge) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO public.text_embeddings (tweet_id, content, embedding) VALUES ($1::uuid, $2::text, $3::vector)`,
      tweetId,
      text,
      JSON.stringify(bge)
    );
  }
  if (imageUrl && clipImage) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO public.image_embeddings (tweet_id, image_url, embedding) VALUES ($1::uuid, $2::text, $3::vector)`,
      tweetId,
      imageUrl,
      JSON.stringify(clipImage)
    );
  }

  return { bgeEmbedding: bge, clipTextEmbedding: clipText, clipImageEmbedding: clipImage } as any;
}


