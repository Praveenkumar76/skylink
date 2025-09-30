import { NextRequest } from "next/server";
import { getRagResponse } from "@/utilities/rag/ragService";
import { processUserRequest } from "@/services/agentService";
import { prisma } from "@/prisma/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = (body?.query || body?.message || body?.q || body?.prompt || "").toString();
    let userId = body?.userId ? String(body.userId) : undefined;
    if (!userId && body?.username) {
      const user = await prisma.user.findUnique({ where: { username: String(body.username) }, select: { id: true } });
      if (user) userId = user.id;
    }
    if (!query) {
      return new Response(JSON.stringify({ error: "Missing 'query' or 'prompt' in body" }), { status: 400 });
    }
    const answer = userId
      ? await processUserRequest({ prompt: query, userId })
      : await getRagResponse(query);
    return new Response(JSON.stringify({ answer }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Internal error" }), { status: 500 });
  }
}


