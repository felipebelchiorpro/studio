import { pb } from '@/lib/pocketbase';

/**
 * Uploads a file to PocketBase 'media' collection.
 * @param file The file to upload.
 * @param bucket Ignored in PocketBase (we use 'media' collection).
 * @param subfolder Ignored in PocketBase.
 * @returns The public URL of the uploaded file.
 */
export const uploadFile = async (file: File, bucket: string = 'media', subfolder: string = ''): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const record = await pb.collection('media').create(formData);

        // Construct URL: /api/files/COLLECTION_ID_OR_NAME/RECORD_ID/FILENAME
        const url = `${pb.baseUrl}/api/files/${record.collectionId}/${record.id}/${record.file}`;
        return url;
    } catch (error: any) {
        console.error(`Error uploading file to PocketBase:`, error);
        throw new Error(error.message || "Falha ao enviar arquivo.");
    }
};
