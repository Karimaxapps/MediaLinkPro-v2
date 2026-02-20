import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { toast } from 'sonner';

interface UseImageUploadOptions {
    onSuccess?: (url: string) => void;
    userId: string;
    bucket?: string;
}

export function useImageUpload({ onSuccess, userId, bucket = 'profiles' }: UseImageUploadOptions) {
    const [isUploading, setIsUploading] = useState(false);
    const supabase = createClient();

    const uploadImage = async (file: File, folder: string = 'uploads') => {
        try {
            setIsUploading(true);

            // Validation
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Image size must be less than 5MB');
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}_${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${folder}/${fileName}`;

            // Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    upsert: true
                });

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            toast.success('Image uploaded successfully');
            onSuccess?.(publicUrl);
            return publicUrl;

        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    return {
        uploadImage,
        isUploading
    };
}
