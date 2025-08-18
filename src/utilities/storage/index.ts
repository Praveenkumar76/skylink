import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!URL || !KEY) throw new Error("Supabase credentials are not provided.");

export const supabase = createClient(URL, KEY);

export const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // ✅ STEP 1: Get the current user's session
      const { data: { user } } = await supabase.auth.getUser();
  
      // ✅ STEP 2: Check if the user is actually logged in
      if (!user) {
        // If the user is null, the upload will fail. Throw an error.
        throw new Error("User is not authenticated. Cannot upload image.");
      }
  
      // Create a unique file name to prevent overwriting files
      const fileName = `${Date.now()}_${file.name}`;
  
      // ✅ STEP 3: Proceed with the upload. The Supabase client will
      // automatically include the authentication token.
      const { error } = await supabase.storage
        .from('media') // Your bucket name
        .upload(fileName, file);
  
      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error('Error uploading image.');
      }
  
      // Get the public URL of the successfully uploaded file
      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);
  
      return data.publicUrl;
  
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
};
