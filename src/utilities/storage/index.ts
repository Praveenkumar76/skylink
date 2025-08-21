import { createClient } from "@supabase/supabase-js";

// Use the server-side variables. The '!' tells TypeScript they will definitely exist.
const URL = process.env.SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// This is now an authenticated, server-side client
export const supabase = createClient(URL, KEY);

type UploadFolder = "profiles" | "tweets" | "chat";

// Server-side upload function that uses service role key
export const uploadFileServer = async (file: File, folder: UploadFolder, userId: string): Promise<string | null> => {
    try {
        const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
        const fileName = `${Date.now()}_${safeName}`;
        const objectPath = `${folder}/${userId}/${fileName}`;

        // Use the server-side client with service role key
        const { error } = await supabase.storage.from("media").upload(objectPath, file);
        if (error) {
            console.error("Supabase upload error:", error);
            throw new Error("Error uploading image.");
        }

        return objectPath;
    } catch (error) {
        console.error("Upload failed:", error);
        return null;
    }
};