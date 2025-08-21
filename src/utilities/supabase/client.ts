import { createClient } from "@supabase/supabase-js";

// Use the public environment variables for the client-side instance
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

// This is your new client-side Supabase client
export const supabase = createClient(URL, KEY);
