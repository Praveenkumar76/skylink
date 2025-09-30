import { prisma } from "@/prisma/client";
import { revalidatePath } from 'next/cache';
import { createAndStoreEmbeddings } from "@/utilities/rag/embeddingService";

export async function createPostInSkylink({ content, userId }: { content: string; userId: string }): Promise<string> {
  const created = await prisma.tweet.create({
    data: {
      text: content,
      authorId: userId,
    },
    select: { id: true },
  });
  // Create a text embedding for the post so it is retrievable by RAG (best-effort)
  try {
    await createAndStoreEmbeddings({ text: content, tweetId: created.id });
  } catch (e) {
    console.error("Embedding creation failed; proceeding without embeddings", e);
  }

  // Revalidate feeds/profile pages so the new post appears immediately
  revalidatePath('/');
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
  if (user?.username) {
    revalidatePath(`/${user.username}`);
  }

  return `Successfully created a new post.`;
}

export async function updateSkylinkProfile({ userId, updates }: { userId: string; updates: { name?: string; description?: string; bio?: string; location?: string; website?: string; city?: string; district?: string; place?: string; websiteUrl?: string } }): Promise<string> {
  // DEBUG LOGS
  console.log("--- Attempting Profile Update ---");
  console.log("Received User ID:", userId);
  console.log("Received Updates Object:", updates);
  const resolvedLocation = updates.location || updates.city || updates.district || updates.place;
  const resolvedWebsite = updates.website || updates.websiteUrl;
  const resolvedDescription = updates.description || updates.bio;

  const data: Record<string, unknown> = {};
  if (typeof updates.name === 'string') data.name = updates.name;
  if (typeof resolvedDescription === 'string') data.description = resolvedDescription;
  if (typeof resolvedLocation === 'string') data.location = resolvedLocation;
  if (typeof resolvedWebsite === 'string') data.website = resolvedWebsite;

  if (Object.keys(data).length === 0) {
    console.log("Update failed: No valid fields to update.");
    return "No valid profile fields provided to update.";
  }

  let updated;
  try {
    updated = await prisma.user.update({
      where: { id: userId },
      data: data as any,
      select: { id: true, name: true, description: true, location: true, website: true },
    });
    console.log("Database update successful. New profile values:", updated);
  } catch (error) {
    console.error("ERROR during profile update:", error);
    return "Sorry, an error occurred while trying to update your profile.";
  }

  // Revalidate profile and edit pages to reflect fresh data
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
  if (user?.username) {
    revalidatePath(`/${user.username}`);
    revalidatePath(`/${user.username}/edit`);
    console.log(`Revalidation triggered for paths: /${user.username} and /${user.username}/edit`);
  }

  return `Profile updated. Name: ${updated.name ?? 'unchanged'}, Bio: ${updated.description ?? 'unchanged'}, Location: ${updated.location ?? 'unchanged'}, Website: ${updated.website ?? 'unchanged'}`;
}

export async function getSkylinkProfile({ userId }: { userId: string }): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, description: true, location: true, website: true, username: true },
  });
  if (!user) return "User not found.";
  return `Profile — Name: ${user.name ?? '—'}, Bio: ${user.description ?? '—'}, Location: ${user.location ?? '—'}, Website: ${user.website ?? '—'}`;
}


