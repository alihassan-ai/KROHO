import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
    if (supabaseInstance) return supabaseInstance;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
        // Fallback for build time if needed, but usually we want to know if they are missing at runtime
        console.warn('Supabase environment variables are missing');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    return supabaseInstance;
};

export async function uploadFile(
    file: File,
    bucket: string,
    path: string
) {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return { path: data.path, publicUrl };
}

export async function deleteFile(bucket: string, path: string) {
    const supabase = getSupabase();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
}
