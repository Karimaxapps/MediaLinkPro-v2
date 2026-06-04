"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { uploadOrgLogoAction } from "@/features/organizations/server/stub-actions";

interface AdminLogoUploadProps {
  currentLogoUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  className?: string;
}

export function AdminLogoUpload({
  currentLogoUrl,
  onUploadSuccess,
  className,
}: AdminLogoUploadProps) {
  const t = useTranslations("companies");
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error(t("adminLogoFormatError"));
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadOrgLogoAction(formData);
      if (!result.success) {
        toast.error(result.error ?? t("uploadFailed"));
      } else {
        toast.success(t("logoUploaded"));
        onUploadSuccess(result.url!);
      }
    } finally {
      setIsUploading(false);
      // Reset so re-selecting same file still triggers onChange
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className ?? ""}`}>
      <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
        <Avatar className="w-24 h-24 border-2 border-white/10 group-hover:border-[var(--brand)] transition-colors">
          <AvatarImage src={currentLogoUrl || ""} className="object-cover" />
          <AvatarFallback className="bg-white/5 text-white">
            <Building2 className="w-10 h-10 text-gray-400" />
          </AvatarFallback>
        </Avatar>

        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full pointer-events-none">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <Button
        variant="outline"
        type="button"
        className="border-white/10 text-white hover:bg-white/5 hover:text-[var(--brand)] bg-transparent"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t("uploading")}
          </>
        ) : (
          t("uploadLogo")
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">{t("adminLogoHint")}</p>
    </div>
  );
}
