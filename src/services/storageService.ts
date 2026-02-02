
import { supabase } from '@/lib/supabaseClient';

/**
 * Uploads a file to Supabase Storage.
 * @param file The file to upload.
 * @param bucket The bucket name (default: 'products').
 * @param subfolder Optional subfolder path (e.g., 'covers', 'gallery').
 * @returns The public URL of the uploaded file.
 */
export const uploadFile = async (file: File, bucket: string = 'products', subfolder: string = ''): Promise<string> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${subfolder ? subfolder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return data.publicUrl;
    } catch (error) {
        console.error(`Error uploading file to ${bucket} (Full):`, JSON.stringify(error, null, 2));
        throw error;
    }
};
