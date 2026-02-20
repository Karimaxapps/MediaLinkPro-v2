import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UseProfileUploadOptions {
    onSuccess?: (url: string) => void;
    currentUserId: string;
}

export function useProfileUpload({ onSuccess, currentUserId }: UseProfileUploadOptions) {
    const [isUploading, setIsUploading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const uploadImage = async (file: File, type: 'avatar' | 'cover') => {
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
            const fileName = `${type}_${Date.now()}.${fileExt}`;
            const filePath = `${currentUserId}/${fileName}`;

            // Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, file, {
                    upsert: true
                });

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath);

            // Update Profile Record
            const updateData = type === 'avatar'
                ? { avatar_url: publicUrl }
                : { cover_url: publicUrl };

            const { error: updateError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', currentUserId);

            if (updateError) {
                throw updateError;
            }

            toast.success(`${type === 'avatar' ? 'Profile photo' : 'Cover image'} updated successfully`);
            onSuccess?.(publicUrl);
            router.refresh();

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
