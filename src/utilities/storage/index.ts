import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!URL || !KEY) throw new Error("Supabase credentials are not provided.");

export const supabase = createClient(URL, KEY);

type UploadFolder = "profiles" | "tweets" | "chat";

// Uploads to media bucket under {folder}/{auth.uid}/{filename}
// Returns the relative path, which should be rendered with getFullURL
export const uploadFile = async (file: File, folder: UploadFolder): Promise<string | null> => {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("User is not authenticated. Cannot upload image.");
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
        const fileName = `${Date.now()}_${safeName}`;
        const objectPath = `${folder}/${user.id}/${fileName}`;

        const { error } = await supabase.storage.from("media").upload(objectPath, file);
        if (error) {
            console.error("Supabase upload error:", error);
            throw new Error("Error uploading image.");
        }

        return objectPath; // relative path for getFullURL
    } catch (error) {
        console.error("Upload failed:", error);
        return null;
    }
};
