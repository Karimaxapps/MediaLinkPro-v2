'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, User } from 'lucide-react';
import { useProfileUpload } from '@/hooks/use-profile-upload';

interface AvatarUploadProps {
    currentUserId: string;
    currentAvatarUrl?: string | null;
    onUploadSuccess: (url: string) => void;
    className?: string; // Allow custom styling
}

export function AvatarUpload({ currentUserId, currentAvatarUrl, onUploadSuccess, className }: AvatarUploadProps) {
    const { uploadImage, isUploading } = useProfileUpload({
        currentUserId,
        onSuccess: onUploadSuccess
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadImage(file, 'avatar');
    };

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            <div className="relative group cursor-pointer">
                <Avatar className="w-24 h-24 border-2 border-white/10 group-hover:border-[#C6A85E] transition-colors">
                    <AvatarImage src={currentAvatarUrl || ''} className="object-cover" />
                    <AvatarFallback className="bg-white/5 text-white">
                        <User className="w-10 h-10 text-gray-400" />
                    </AvatarFallback>
                </Avatar>

                <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                >
                    {isUploading ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                        <Camera className="w-6 h-6 text-white" />
                    )}
                </label>
                <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </div>

            <label htmlFor="avatar-upload">
                <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5 hover:text-[#C6A85E] bg-transparent"
                    disabled={isUploading}
                    asChild // Render as span to avoid button-in-label issues if any, but Input is hidden so Button triggers label
                >
                    <span className="cursor-pointer">
                        {isUploading ? 'Uploading...' : 'Change Photo'}
                    </span>
                </Button>
            </label>
        </div>
    );
}
