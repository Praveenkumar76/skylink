import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

import { verifyJwtToken } from "@/utilities/auth";

type UploadFolder = "profiles" | "tweets" | "chat";

export async function POST(request: NextRequest) {
    try {
        const form = await request.formData();
        const file = form.get("file") as File | null;
        const folder = form.get("folder") as UploadFolder | null;

        if (!file || !folder) {
            return NextResponse.json({ success: false, message: "Missing file or folder." }, { status: 400 });
        }

        const token = (await cookies()).get("token")?.value || null;
        const verifiedToken = token && (await verifyJwtToken(token));
        if (!verifiedToken) {
            return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
        }

        const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!SUPABASE_URL || !SERVICE_KEY) {
            return NextResponse.json({ success: false, message: "Supabase service credentials missing." }, { status: 500 });
        }

        const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
        const fileName = `${Date.now()}_${safeName}`;
        const objectPath = `${folder}/${verifiedToken.id}/${fileName}`;

        const { error } = await supabase.storage.from("media").upload(objectPath, buffer, {
            contentType: file.type || "application/octet-stream",
            cacheControl: "3600",
            upsert: false,
        });
        if (error) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, path: objectPath });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}


