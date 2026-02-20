"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Twitter,
    Facebook,
    Linkedin,
    Link as LinkIcon,
    Mail,
    Share2
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ProductShareProps {
    productName: string;
    slug: string;
    companyName?: string;
}

export function ProductShare({ productName, slug, companyName }: ProductShareProps) {
    const [shareUrl, setShareUrl] = useState("");

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined") {
            setShareUrl(`${window.location.origin}/products/${slug}`);
        }
    }, [slug]);

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
    };

    const shareLinks = [
        {
            name: "Twitter",
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=Check out ${encodeURIComponent(productName)} by ${encodeURIComponent(companyName || "")}&url=${encodeURIComponent(shareUrl)}`,
            color: "hover:bg-[#1DA1F2] hover:text-white border-white/10"
        },
        {
            name: "Facebook",
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            color: "hover:bg-[#4267B2] hover:text-white border-white/10"
        },
        {
            name: "LinkedIn",
            icon: Linkedin,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            color: "hover:bg-[#0077b5] hover:text-white border-white/10"
        },
        {
            name: "Email",
            icon: Mail,
            url: `mailto:?subject=Check out ${encodeURIComponent(productName)}&body=I found this interesting product on MediaLinkPro: ${encodeURIComponent(shareUrl)}`,
            color: "hover:bg-gray-600 hover:text-white border-white/10"
        }
    ];

    if (!mounted) {
        return (
            <Button variant="outline" size="icon" className="h-11 w-11 border-white/10 bg-white/5 hover:bg-white/10 text-[#C6A85E] hover:text-[#B5964A] transition-colors">
                <Share2 className="w-5 h-5" />
            </Button>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-11 w-11 border-white/10 bg-white/5 hover:bg-white/10 text-[#C6A85E] hover:text-[#B5964A] transition-colors">
                    <Share2 className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#1A1D21] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Share Product</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Share this product with your network.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap-4 justify-center py-6">
                    {shareLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-3 rounded-full border border-white/10 transition-colors ${link.color}`}
                            title={`Share on ${link.name}`}
                        >
                            <link.icon className="w-5 h-5 text-gray-300 group-hover:text-white" />
                        </a>
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                        <label htmlFor="link" className="sr-only">
                            Link
                        </label>
                        <input
                            id="link"
                            defaultValue={shareUrl}
                            readOnly
                            className="flex h-9 w-full rounded-md border border-white/10 bg-white/5 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6A85E] disabled:cursor-not-allowed disabled:opacity-50 text-gray-300"
                        />
                    </div>
                    <Button type="button" size="sm" className="px-3 bg-[#C6A85E] hover:bg-[#B5964D] text-black" onClick={copyLink}>
                        <span className="sr-only">Copy</span>
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
