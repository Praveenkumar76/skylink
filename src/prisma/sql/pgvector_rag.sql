-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Text embeddings table for BAAI bge-small-en-v1.5 (384 dims)
CREATE TABLE IF NOT EXISTS public.text_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id UUID NULL,
  content TEXT NOT NULL,
  embedding VECTOR(384) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Image embeddings table for CLIP ViT-L/14 (768 dims)
CREATE TABLE IF NOT EXISTS public.image_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id UUID NULL,
  image_url TEXT NOT NULL,
  embedding VECTOR(768) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional indexes for faster ANN (IVFFLAT); requires pgvector >= 0.5.0 and ANALYZE after creation
-- CREATE INDEX IF NOT EXISTS text_embeddings_embedding_idx ON public.text_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX IF NOT EXISTS image_embeddings_embedding_idx ON public.image_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Function: match_tweets_by_text
-- Returns top-K closest texts for a given query embedding
CREATE OR REPLACE FUNCTION public.match_tweets_by_text(
  query_embedding VECTOR(384),
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  tweet_id UUID,
  content TEXT,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT te.id, te.tweet_id, te.content, (te.embedding <-> query_embedding) AS distance
  FROM public.text_embeddings te
  ORDER BY te.embedding <-> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE PARALLEL SAFE;

-- Function: match_images_by_text
-- Input is a CLIP text query embedding (768) matched against image embeddings
CREATE OR REPLACE FUNCTION public.match_images_by_text(
  query_embedding VECTOR(768),
  match_count INT DEFAULT 2
)
RETURNS TABLE (
  id UUID,
  tweet_id UUID,
  image_url TEXT,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT ie.id, ie.tweet_id, ie.image_url, (ie.embedding <-> query_embedding) AS distance
  FROM public.image_embeddings ie
  ORDER BY ie.embedding <-> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE PARALLEL SAFE;


