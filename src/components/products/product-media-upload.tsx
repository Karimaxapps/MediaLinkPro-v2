'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useImageUpload } from '@/hooks/use-image-upload';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon, X, UploadCloud } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ProductMediaUploadProps {
    userId: string;
    organizationId: string;
    mainImageUrl?: string;
    galleryUrls?: string[];
    onMainImageChange: (url: string) => void;
    onGalleryChange: (urls: string[]) => void;
    className?: string;
    mainImageError?: string;
    galleryError?: string;
}

export function ProductMediaUpload({
    userId,
    organizationId,
    mainImageUrl,
    galleryUrls = [],
    onMainImageChange,
    onGalleryChange,
    className,
    mainImageError,
    galleryError
}: ProductMediaUploadProps) {

    // Hook for uploading images (reusing existing hook)
    // We pass organizationId as part of the path logic if needed, but the hook uses userId by default.
    // Ideally we should upload to organization folder, but for now we follow existing pattern.
    const { uploadImage, isUploading } = useImageUpload({
        userId,
        bucket: 'products',
        onSuccess: () => { } // Handled manually
    });

    const [uploadingMain, setUploadingMain] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);

    const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error('Main image must be less than 2MB');
            return;
        }

        setUploadingMain(true);
        try {
            // Upload to products bucket or folder
            const url = await uploadImage(file, 'product-images');
            if (url) {
                onMainImageChange(url);
            }
        } finally {
            setUploadingMain(false);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (galleryUrls.length + files.length > 5) {
            toast.error('You can only have up to 5 gallery images');
            return;
        }

        setUploadingGallery(true);
        try {
            const newUrls: string[] = [];

            for (const file of files) {
                if (file.size > 1024 * 1024) { // 1MB limit per gallery image
                    toast.error(`Image ${file.name} is too large (>1MB) and was skipped`);
                    continue;
                }

                const url = await uploadImage(file, 'product-gallery');
                if (url) {
                    newUrls.push(url);
                }
            }

            if (newUrls.length > 0) {
                onGalleryChange([...galleryUrls, ...newUrls]);
            }
        } finally {
            setUploadingGallery(false);
        }
    };

    const removeGalleryImage = (indexToRemove: number) => {
        const newUrls = galleryUrls.filter((_, index) => index !== indexToRemove);
        onGalleryChange(newUrls);
    };

    return (
        <div className={cn("space-y-8", className)}>

            {/* Main Image Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#C6A85E]" />
                    Main Product Image
                    <span className="text-red-500">*</span>
                </h3>

                <div className="flex items-start gap-6">
                    <div className={cn(
                        "relative w-40 h-40 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden bg-black/20 transition-all",
                        !mainImageUrl && "hover:border-[#C6A85E]/50 hover:bg-black/30",
                        mainImageError && "border-red-500"
                    )}>
                        {mainImageUrl ? (
                            <>
                                <img src={mainImageUrl} alt="Main product" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label htmlFor="main-image-upload" className="cursor-pointer text-white text-xs font-medium hover:underline">
                                        Change
                                    </label>
                                </div>
                            </>
                        ) : (
                            <label htmlFor="main-image-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2 p-2 text-center">
                                {uploadingMain ? (
                                    <Loader2 className="w-8 h-8 text-[#C6A85E] animate-spin" />
                                ) : (
                                    <>
                                        <UploadCloud className="w-8 h-8 text-gray-400" />
                                        <span className="text-xs text-gray-500">Upload Image<br />(Max 2MB)</span>
                                    </>
                                )}
                            </label>
                        )}
                        <input
                            id="main-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleMainImageUpload}
                            disabled={uploadingMain}
                        />
                    </div>

                    <div className="flex-1 text-sm text-gray-400 space-y-2">
                        <p>This is the primary image that will be displayed on product cards and the top of your product page.</p>
                        <p>Recommended size: 1200x630px or 1:1 square.</p>
                        {mainImageError && <p className="text-red-500 font-medium">{mainImageError}</p>}
                    </div>
                </div>
            </div>

            {/* Gallery Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    Gallery Images
                    <span className="text-xs font-normal text-gray-500 ml-2">(Max 5 images, 1MB each)</span>
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {galleryUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg border border-white/10 overflow-hidden group bg-black/20">
                            <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {galleryUrls.length < 5 && (
                        <div className={cn(
                            "relative aspect-square rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden bg-black/20 transition-all",
                            "hover:border-white/40 hover:bg-black/30",
                            galleryError && "border-red-500"
                        )}>
                            <label htmlFor="gallery-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2 text-center">
                                {uploadingGallery ? (
                                    <Loader2 className="w-6 h-6 text-[#C6A85E] animate-spin" />
                                ) : (
                                    <>
                                        <UploadCloud className="w-6 h-6 text-gray-400" />
                                        <span className="text-xs text-gray-500">Add Image</span>
                                    </>
                                )}
                            </label>
                            <input
                                id="gallery-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleGalleryUpload}
                                disabled={uploadingGallery}
                            />
                        </div>
                    )}
                </div>
                {galleryError && <p className="text-sm text-red-500">{galleryError}</p>}
            </div>
        </div>
    );
}
