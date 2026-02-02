
import { supabase } from '@/lib/supabaseClient';

const BUCKET_NAME = 'products';

/**
 * Uploads a file to Supabase Storage.
 * @param file The file to upload.
 * @param subfolder Optional subfolder path (e.g., 'covers', 'gallery').
 * @returns The public URL of the uploaded file.
 */
export const uploadFile = async (file: File, subfolder: string = ''): Promise<string> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${subfolder ? subfolder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};
