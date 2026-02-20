'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Building2 } from 'lucide-react';
import { useImageUpload } from '@/hooks/use-image-upload';
import { toast } from 'sonner';

interface CompanyLogoUploadProps {
    userId: string;
    currentLogoUrl?: string | null;
    onUploadSuccess: (url: string) => void;
    className?: string;
}

export function CompanyLogoUpload({ userId, currentLogoUrl, onUploadSuccess, className }: CompanyLogoUploadProps) {
    const { uploadImage, isUploading } = useImageUpload({
        userId,
        onSuccess: onUploadSuccess
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            toast.error('Only JPG, JPEG, and PNG files are supported');
            return;
        }

        await uploadImage(file, 'company_logos');
    };

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            <div className="relative group cursor-pointer">
                <Avatar className="w-24 h-24 border-2 border-white/10 group-hover:border-[#C6A85E] transition-colors">
                    <AvatarImage src={currentLogoUrl || ''} className="object-cover" />
                    <AvatarFallback className="bg-white/5 text-white">
                        <Building2 className="w-10 h-10 text-gray-400" />
                    </AvatarFallback>
                </Avatar>

                <label
                    htmlFor="logo-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                >
                    {isUploading ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                        <Camera className="w-6 h-6 text-white" />
                    )}
                </label>
                <input
                    id="logo-upload"
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </div>

            <label htmlFor="logo-upload">
                <Button
                    variant="outline"
                    type="button"
                    className="border-white/10 text-white hover:bg-white/5 hover:text-[#C6A85E] bg-transparent"
                    disabled={isUploading}
                    asChild
                >
                    <span className="cursor-pointer">
                        {isUploading ? 'Uploading...' : 'Upload Logo'}
                    </span>
                </Button>
            </label>
            <p className="text-xs text-gray-500 text-center">
                300 x 300px recommended. JPGs, JPEGs, and PNGs supported.
            </p>
        </div>
    );
}
