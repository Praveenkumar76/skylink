type UploadFolder = "profiles" | "tweets" | "chat";

// Client-side upload function that proxies to our Next.js API route.
// The API route validates the JWT cookie and uploads with the Supabase service key.
export const uploadFile = async (file: File, folder: UploadFolder): Promise<string | null> => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/storage/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const { message } = (await res.json().catch(() => ({ message: "Upload failed" }))) as { message?: string };
            console.error("Upload API error:", message);
            return null;
        }

        const json = (await res.json()) as { success: boolean; path?: string };
        if (!json.success || !json.path) return null;
        return json.path;
    } catch (error) {
        console.error("Upload failed:", error);
        return null;
    }
};
