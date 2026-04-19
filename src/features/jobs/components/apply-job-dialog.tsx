"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Link2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { submitApplication } from "../server/actions";
import type { ResumeType } from "../types";

type Props = {
  jobId: string;
  jobTitle: string;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function ApplyJobDialog({ jobId, jobTitle, userId, onClose, onSuccess }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resumeType, setResumeType] = useState<ResumeType>("link");
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are accepted.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("PDF must be under 8MB.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const safeName = file.name.replace(/[^\w.-]+/g, "_");
      const path = `${userId}/${Date.now()}_${safeName}`;
      const { error } = await supabase.storage
        .from("resumes")
        .upload(path, file, { upsert: false, contentType: "application/pdf" });
      if (error) throw error;

      const { data } = supabase.storage.from("resumes").getPublicUrl(path);
      setResumeUrl(data.publicUrl);
      setUploadedFileName(file.name);
      toast.success("Resume uploaded");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeUrl.trim()) {
      toast.error(
        resumeType === "link" ? "Please provide a resume URL." : "Please upload a PDF resume."
      );
      return;
    }

    startTransition(async () => {
      const result = await submitApplication({
        job_id: jobId,
        resume_url: resumeUrl.trim(),
        resume_type: resumeType,
        cover_letter: coverLetter.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      if (result.success) {
        toast.success("Application submitted!");
        onSuccess();
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to submit application");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0B0F14] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Apply to this role</h2>
            <p className="text-sm text-gray-400 line-clamp-1">{jobTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Resume *</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setResumeType("link");
                  setResumeUrl("");
                  setUploadedFileName(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-md border transition-colors ${
                  resumeType === "link"
                    ? "bg-[#C6A85E]/20 border-[#C6A85E]/40 text-[#C6A85E]"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                <Link2 className="h-3.5 w-3.5" />
                Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setResumeType("pdf");
                  setResumeUrl("");
                  setUploadedFileName(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-md border transition-colors ${
                  resumeType === "pdf"
                    ? "bg-[#C6A85E]/20 border-[#C6A85E]/40 text-[#C6A85E]"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Upload PDF
              </button>
            </div>

            {resumeType === "link" ? (
              <Input
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://yourportfolio.com/cv"
                type="url"
                className="bg-black/20 border-white/10 text-white"
              />
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-white/10 bg-black/20 px-4 py-6 cursor-pointer hover:border-[#C6A85E]/40 hover:bg-white/5 transition-colors">
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-300">
                  {uploading
                    ? "Uploading..."
                    : uploadedFileName
                      ? uploadedFileName
                      : "Click to upload your PDF resume"}
                </span>
                <span className="text-xs text-gray-500">PDF only, up to 8MB</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Phone (optional)</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Cover letter (optional)</Label>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the company why you're a great fit..."
              rows={5}
              className="bg-black/20 border-white/10 text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/10"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || uploading || !resumeUrl.trim()}
              className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium"
            >
              {isPending ? "Submitting..." : "Submit application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
