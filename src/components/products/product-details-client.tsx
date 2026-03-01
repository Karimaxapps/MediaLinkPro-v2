"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AddResourceDialog } from "@/features/products/components/add-resource-dialog";
import { EditResourceDialog } from "@/features/products/components/edit-resource-dialog";
import { getProductOfficialResources, deleteProductResource, removeProductTrainingVideo } from "@/features/products/server/actions";
import { format } from "date-fns";
import {
    CheckCircle,
    Globe,
    FileText,
    Award,
    Video,
    GraduationCap,
    Tag,
    Building2,
    ArrowUpRight,
    Play,
    Mail,
    Edit,
    ArrowLeft,
    Trash2,
    Users,
    BookOpen,
    Eye,
    Bookmark,
    QrCode,
    Scan,
    Info,
    Lightbulb,
    MoreHorizontal,
    ThumbsUp,
    ArrowBigUp,
    Plus,
    Youtube,
} from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";

import { ProductQRCode } from "@/components/products/product-qr-code";
import { ProductShare } from "@/components/products/product-share";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { toast } from "sonner";
import { getProductResources, getProductExperts, joinProductExperts, removeProductExpert, incrementProductView, incrementProductQRScan, toggleBookmark, getBookmarkStatus, getProductDemoRequestsCount, deleteProduct, addCommunityVideo, deleteCommunityResource, toggleResourceUpvote } from "@/features/products/server/actions";
import { RequestDemoDialog } from "@/features/products/components/request-demo-dialog";
import { DemoRequestsDialog } from "@/components/products/demo-requests-dialog";
import { ProductBookmarksDialog } from "@/components/products/product-bookmarks-dialog";
import { ProductScansDialog } from "@/components/products/product-scans-dialog";

interface ProductDetailsProps {
    product: any;
    user: any;
    userProfile?: any;
    isOwner?: boolean;
}

function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export function ProductDetailsClient({ product, user, userProfile, isOwner = false }: ProductDetailsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeImage, setActiveImage] = useState<string | null>(product.promo_video_url ? 'video' : null);
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
    const [expertiseLevel, setExpertiseLevel] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [officialResources, setOfficialResources] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        getProductOfficialResources(product.id).then(setOfficialResources);
    }, [product.id]);

    const handleResourceAdded = () => {
        getProductOfficialResources(product.id).then(setOfficialResources);
        router.refresh();
    };

    const handleDeleteResource = async (resourceId: string) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;

        const result = await deleteProductResource(resourceId);
        if (result.success) {
            toast.success("Resource deleted");
            handleResourceAdded();
        } else {
            toast.error(result.error || "Failed to delete resource");
        }
    };
    const [experts, setExperts] = useState<any[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);
    const [isExpert, setIsExpert] = useState(false);
    const [animatingResources, setAnimatingResources] = useState<Record<string, boolean>>({});
    const [viewCount, setViewCount] = useState(product.views_count || product.view_count || 0);
    const [qrScanCount, setQrScanCount] = useState(product.qr_scans_count || product.qr_scan_count || 0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isBookmarkLoading, setIsBookmarkLoading] = useState(true);
    const [bookmarkCount, setBookmarkCount] = useState(0);
    const [demoRequestCount, setDemoRequestCount] = useState(0);
    const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
    const [newVideoUrl, setNewVideoUrl] = useState("");
    const [newVideoTitle, setNewVideoTitle] = useState("");
    const [isAddingVideo, setIsAddingVideo] = useState(false);


    const gallery = product.gallery_urls || [];

    const editor = useEditor({
        extensions: [StarterKit],
        content: product.description || '',
        editable: false,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none',
            },
        },
    });

    useEffect(() => {
        if (product.description && editor) {
            editor.commands.setContent(product.description);
        }
    }, [product.description, editor]);

    useEffect(() => {
        const loadCommunityData = async () => {
            setIsLoadingCommunity(true);
            try {
                const [expertsData, resourcesData] = await Promise.all([
                    getProductExperts(product.id),
                    getProductResources(product.id)
                ]);
                console.log("Client expertsData:", JSON.stringify(expertsData, null, 2));
                setExperts(expertsData || []);
                setResources(resourcesData || []);

                if (user) {
                    const currentUserExpert = expertsData.find((e: any) => e.user_id === user.id);
                    setIsExpert(!!currentUserExpert);
                }
            } catch (error) {
                console.error("Error loading community data:", error);
                toast.error("Failed to load community data");
            } finally {
                setIsLoadingCommunity(false);
            }
        };

        loadCommunityData();
    }, [product.id, user]);

    // Track view
    useEffect(() => {
        const trackView = async () => {
            try {
                const views = await incrementProductView(product.id);
                setViewCount(views);
            } catch (err) {
                console.error("Failed to track view", err);
            }
        };
        trackView();
    }, [product.id]);

    // Track QR scan if query param exists
    useEffect(() => {
        const source = searchParams.get('source');
        if (source === 'qr') {
            const trackScan = async () => {
                try {
                    const scans = await incrementProductQRScan(product.id);
                    setQrScanCount(scans);
                    toast.success("Product scanned via QR Code!");
                } catch (err) {
                    console.error("Failed to track scan", err);
                }
            };
            trackScan();
        } else {
            // Just fetch current count if not a new scan
            // We can't easily fetch just the count without incrementing with current actions structure
            // For now assume view count logic handles initial fetch or add a getStats action.
            // Let's just set initial state from props if available or 0.
            // Actually increment returns the new count.
            // We might want a separate getStats action but for now let's leave it as 0 until interacted or add it later.
            setQrScanCount(product.qr_scans_count || product.qr_scan_count || 0);
        }
    }, [product.id, searchParams, product.qr_scan_count]);

    // Check bookmark status
    useEffect(() => {
        const checkBookmark = async () => {
            if (!user) {
                setIsBookmarkLoading(false);
                return;
            }
            try {
                const { bookmarked, count } = await getBookmarkStatus(product.id);
                setIsBookmarked(bookmarked);
                setBookmarkCount(count);
            } catch (err) {
                console.error("Failed to check bookmark", err);
            } finally {
                setIsBookmarkLoading(false);
            }
        };
        checkBookmark();
    }, [product.id, user]);

    // Fetch demo request count for owners
    useEffect(() => {
        if (isOwner) {
            const loadDemoRequests = async () => {
                try {
                    const count = await getProductDemoRequestsCount(product.id);
                    setDemoRequestCount(count);
                } catch (error) {
                    console.error("Failed to load demo requests count", error);
                }
            };
            loadDemoRequests();
        }
    }, [isOwner, product.id]);


    const handleJoinExperts = async () => {
        if (!user) {
            toast.error("Please sign in to join the community");
            router.push("/sign-in");
            return;
        }

        if (!expertiseLevel) {
            toast.error("Please select your expertise level");
            return;
        }

        setIsJoining(true);
        try {
            const result = await joinProductExperts(product.id, expertiseLevel);
            if (result.success) {
                toast.success("You have joined the product community!");
                setIsExpert(true);
                setIsJoinDialogOpen(false);
                // Refresh experts
                const updatedExperts = await getProductExperts(product.id);
                setExperts(updatedExperts);
            } else {
                toast.error(result.error || "Failed to join community");
            }
        } catch (error) {
            console.error("Error joining community:", error);
            toast.error("Failed to join community");
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeaveExperts = async () => {
        setIsJoining(true);
        try {
            await removeProductExpert(product.id, user.id);
            toast.success("You have left the product community");
            setIsExpert(false);
            setExpertiseLevel("");
            // Refresh experts
            const updatedExperts = await getProductExperts(product.id);
            setExperts(updatedExperts);
        } catch (error) {
            console.error("Error leaving community:", error);
            toast.error("Failed to leave community");
        } finally {
            setIsJoining(false);
            setIsLeaveDialogOpen(false);
        }
    };

    const handleRemoveExpert = async (userId: string) => {
        if (!confirm("Remove this user from product experts?")) return;

        try {
            await removeProductExpert(product.id, userId);
            toast.success("User removed from experts");
            // Refresh experts
            const updatedExperts = await getProductExperts(product.id);
            setExperts(updatedExperts);
        } catch (error) {
            console.error("Error removing expert:", error);
            toast.error("Failed to remove expert");
        }
    };

    const handleAddVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please sign in to add a video");
            return;
        }
        if (!newVideoUrl || !newVideoTitle) {
            toast.error("Please enter both title and URL");
            return;
        }

        setIsAddingVideo(true);
        try {
            const result = await addCommunityVideo(product.id, newVideoTitle, newVideoUrl);
            if (result.success) {
                toast.success("Video added successfully");
                setIsAddVideoOpen(false);
                setNewVideoUrl("");
                setNewVideoTitle("");
                // Refresh resources
                const updatedResources = await getProductResources(product.id);
                setResources(updatedResources || []);
            } else {
                toast.error(result.error || "Failed to add video");
            }
        } catch (error) {
            console.error("Error adding video:", error);
            toast.error("An error occurred");
        } finally {
            setIsAddingVideo(false);
        }
    };

    const handleUpvote = async (resourceId: string) => {
        if (!user) {
            toast.error("Please sign in to upvote");
            return;
        }

        // Trigger animation
        setAnimatingResources(prev => ({ ...prev, [resourceId]: true }));
        setTimeout(() => {
            setAnimatingResources(prev => ({ ...prev, [resourceId]: false }));
        }, 400);

        // Optimistic update
        setResources(prev => prev.map(r => {
            if (r.id === resourceId) {
                return {
                    ...r,
                    upvotes_count: r.is_upvoted ? r.upvotes_count - 1 : r.upvotes_count + 1,
                    is_upvoted: !r.is_upvoted
                };
            }
            return r;
        }).sort((a, b) => b.upvotes_count - a.upvotes_count)); // Re-sort optimistically

        try {
            const result = await toggleResourceUpvote(resourceId);
            if (!result.success) {
                toast.error(result.error);
                // Revert if failed (could be complex, better to just refresh)
                const updatedResources = await getProductResources(product.id);
                setResources(updatedResources || []);
            }
        } catch (error) {
            console.error("Error toggling upvote:", error);
            toast.error("Failed to upvote");
        }
    };

    const handleDeleteCommunityResource = async (resourceId: string) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;
        try {
            const result = await deleteCommunityResource(resourceId);
            if (result.success) {
                toast.success("Resource deleted");
                setResources(prev => prev.filter(r => r.id !== resourceId));
            } else {
                toast.error(result.error || "Failed to delete");
            }
        } catch (error) {
            console.error("Error deleting resource:", error);
            toast.error("Failed to delete resource");
        }
    };



    const handleDeleteTrainingVideo = async (url: string) => {
        if (!confirm("Are you sure you want to delete this video?")) return;

        try {
            const result = await removeProductTrainingVideo(product.id, url);
            if (result.success) {
                toast.success("Video removed successfully");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to remove video");
            }
        } catch (error) {
            console.error("Error removing video:", error);
            toast.error("Failed to remove video");
        }
    };

    const getResourceIcon = (type: string) => {
        switch (type) {
            case 'official_link': return <Globe className="w-4 h-4 text-blue-400" />;
            case 'youtube': return <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center"><Play className="w-2 h-2 text-white fill-current" /></div></div>;
            case 'training': return <GraduationCap className="w-4 h-4 text-green-400" />;
            case 'documentation': return <FileText className="w-4 h-4 text-orange-400" />;
            case 'certification': return <Award className="w-4 h-4 text-yellow-400" />;
            default: return <Globe className="w-4 h-4 text-gray-400" />;
        }
    };

    const handleToggleBookmark = async () => {
        if (!user) {
            toast.error("Please sign in to bookmark products");
            router.push("/sign-in");
            return;
        }
        // Optimistic update
        const prevBookmarked = isBookmarked;
        const prevCount = bookmarkCount;

        setIsBookmarked(!prevBookmarked);
        setBookmarkCount(prevBookmarked ? prevCount - 1 : prevCount + 1);

        try {
            const { bookmarked, count } = await toggleBookmark(product.id);
            setIsBookmarked(bookmarked);
            setBookmarkCount(count);
            toast.success(bookmarked ? "Product added to bookmarks" : "Product removed from bookmarks");
        } catch (err) {
            // Revert
            setIsBookmarked(prevBookmarked);
            setBookmarkCount(prevCount);
            toast.error("Failed to update bookmark");
        }
    };

    const handleDeleteProduct = async () => {
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            const result = await deleteProduct(product.id);
            if (result.success) {
                toast.success("Product deleted successfully");
                router.push(`/companies/${product.organizations?.slug}/dashboard`);
            } else {
                toast.error(result.error || "Failed to delete product");
                setIsDeleting(false);
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("An error occurred while deleting the product");
            setIsDeleting(false);
        }
    };


    return (
        <div className="min-h-screen pb-20 space-y-8">
            {/* Header */}
            <div>
                {/* Top Nav Bar */}
                <div className="flex justify-between items-center mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
                    <Button
                        variant="ghost"
                        className="text-gray-400 hover:text-white pl-0 gap-2 hover:bg-transparent"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Product details
                    </Button>

                    {isOwner && (
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="bg-[#141312] hover:bg-[#141312]/80 border border-white/10 rounded-xl w-10 h-10" asChild>
                                <Link href={`/products/${product.slug}/edit`}>
                                    <Edit className="w-4 h-4 text-gray-400" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="bg-[#141312] hover:bg-[#141312]/80 border border-white/10 rounded-xl w-10 h-10"
                                onClick={handleDeleteProduct}
                                disabled={isDeleting}
                            >
                                <Trash2 className="w-4 h-4 text-gray-400" />
                            </Button>
                        </div>
                    )}
                </div>

            </div>


            {/* Hero Section */}
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left Column: Product Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{product.name}</h1>
                            <p className="text-xl text-gray-400 mb-4">{product.tagline || "No tagline available"}</p>
                            <div className="flex gap-3 items-center">
                                {product.organizations?.name && (
                                    <Link href={`/companies/${product.organizations.slug}`}>
                                        <Badge variant="outline" className="text-gray-300 border-white/10 bg-white/5 rounded-full px-3 py-1 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                                            <Building2 className="w-3 h-3 mr-2" />
                                            {product.organizations.name}
                                        </Badge>
                                    </Link>
                                )}
                            </div>
                        </div>
                        {/* Description Preview */}
                        <div className="prose prose-invert max-w-none">
                            <p className="text-lg text-gray-300 leading-relaxed">
                                {product.description ?
                                    (product.description.length > 200 ? product.description.substring(0, 200).replace(/<[^>]*>?/gm, '') + '...' : product.description.replace(/<[^>]*>?/gm, ''))
                                    : "No description available."
                                }
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4">
                            {!isOwner && (
                                <>
                                    <RequestDemoDialog
                                        productId={product.id}
                                        productName={product.name}
                                        organizationId={product.organization_id}
                                        user={user}
                                        userProfile={userProfile}
                                        trigger={
                                            <Button className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold h-11 px-6 rounded-lg w-full md:w-auto flex-1 md:flex-none">
                                                Request Demo
                                            </Button>
                                        }
                                    />
                                    {product.organization_id && (
                                        <ContactButton
                                            targetOrganizationId={product.organization_id}
                                            variant="secondary"
                                            className="h-11 px-6 rounded-lg w-full md:w-auto flex-1 md:flex-none"
                                            text="Message Company"
                                        />
                                    )}
                                </>
                            )}

                            <ProductShare
                                productName={product.name}
                                slug={product.slug}
                                companyName={product.organizations?.name}
                            />

                            <ProductQRCode
                                productId={product.id}
                                productName={product.name}
                                slug={product.slug}
                            />

                            <Button
                                variant="outline"
                                size="icon"
                                title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                                className={cn(
                                    "bg-white/5 border-white/10 hover:bg-white/10 transition-colors h-11 w-11 rounded-lg",
                                    isBookmarked && "border-[#C6A85E]/50"
                                )}
                                onClick={!isBookmarkLoading ? handleToggleBookmark : undefined}
                                disabled={isBookmarkLoading}
                            >
                                <Bookmark className={cn("w-5 h-5 text-[#C6A85E]", isBookmarked && "fill-current")} />
                            </Button>
                        </div>

                        {isOwner && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                                <Card className="bg-white/5 border-white/10 h-full py-3 px-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[#C6A85E]">
                                        <Eye className="w-4 h-4 shrink-0" />
                                        <span className="text-sm font-medium whitespace-nowrap">Views</span>
                                    </div>
                                    <span className="text-xl font-bold text-white leading-none">{viewCount}</span>
                                </Card>

                                <DemoRequestsDialog productId={product.id}>
                                    <Card className="bg-white/5 border-white/10 h-full py-3 px-4 flex items-center justify-between cursor-pointer transition-colors hover:border-[#C6A85E]/50">
                                        <div className="flex items-center gap-2 text-[#C6A85E]">
                                            <Mail className="w-4 h-4 shrink-0" />
                                            <span className="text-sm font-medium whitespace-nowrap">Requests</span>
                                        </div>
                                        <span className="text-xl font-bold text-white leading-none">{demoRequestCount}</span>
                                    </Card>
                                </DemoRequestsDialog>

                                <ProductBookmarksDialog productId={product.id}>
                                    <Card
                                        className={cn(
                                            "bg-white/5 border-white/10 h-full py-3 px-4 flex items-center justify-between cursor-pointer transition-colors hover:border-[#C6A85E]"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 text-[#C6A85E]">
                                            <Bookmark className={cn("w-4 h-4 shrink-0", isBookmarked && "fill-current")} />
                                            <span className="text-sm font-medium whitespace-nowrap">Bookmarks</span>
                                        </div>
                                        <span className="text-xl font-bold text-white leading-none">{bookmarkCount}</span>
                                    </Card>
                                </ProductBookmarksDialog>

                                <ProductScansDialog productId={product.id}>
                                    <Card className="bg-white/5 border-white/10 h-full py-3 px-4 flex items-center justify-between cursor-pointer transition-colors hover:border-[#C6A85E]/50">
                                        <div className="flex items-center gap-2 text-[#C6A85E]">
                                            <Scan className="w-4 h-4 shrink-0" />
                                            <span className="text-sm font-medium whitespace-nowrap">QR scan</span>
                                        </div>
                                        <span className="text-xl font-bold text-white leading-none">{qrScanCount}</span>
                                    </Card>
                                </ProductScansDialog>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-[#121212] border border-white/10 relative group shadow-2xl shadow-black/50">
                            {activeImage === 'video' && product.promo_video_url ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={product.promo_video_url.replace("watch?v=", "embed/")}
                                    title="Promo Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                product.logo_url || activeImage ? (
                                    <Image
                                        src={activeImage || product.logo_url}
                                        alt="Product Media"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700 bg-[#0F0F0F]">
                                        <Tag className="w-16 h-16 opacity-20" />
                                    </div>
                                )
                            )}
                        </div>

                        {(gallery.length > 0 || product.promo_video_url) && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center">
                                {gallery.map((url: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(url)}
                                        className={cn(
                                            "w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 relative transition-all bg-[#121212]",
                                            activeImage === url ? "border-[#C6A85E]" : "border-white/5 opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <Image src={url} alt={`Gallery ${i}`} fill className="object-contain p-2" />
                                    </button>
                                ))}
                                {product.promo_video_url && (
                                    <button
                                        onClick={() => setActiveImage('video')}
                                        className={cn(
                                            "w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 relative transition-all bg-[#121212] flex items-center justify-center group",
                                            activeImage === 'video' ? "border-[#C6A85E]" : "border-white/5 opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <Play className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content (Left, 2 cols) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Tabs */}
                        <Tabs defaultValue="overview" className="w-full" id="product-tabs">
                            <TabsList className="bg-white/5 border border-white/10 w-full justify-start overflow-x-auto scrollbar-hide">
                                <TabsTrigger value="overview" className="text-white data-[state=active]:bg-[#C6A85E] data-[state=active]:text-black">Overview</TabsTrigger>
                                <TabsTrigger value="training" className="text-white data-[state=active]:bg-[#C6A85E] data-[state=active]:text-black">Official Resources</TabsTrigger>
                                <TabsTrigger value="community" className="text-white data-[state=active]:bg-[#C6A85E] data-[state=active]:text-black">Community Resources</TabsTrigger>
                                <TabsTrigger value="users" className="hidden">Product Users</TabsTrigger>
                            </TabsList>

                            <div className="mt-6">
                                <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <Card className="bg-white/5 border-white/10 text-white">
                                        <CardHeader>
                                            <CardTitle>Description</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {product.description ? (
                                                <EditorContent editor={editor} />
                                            ) : (
                                                <p className="text-gray-500 italic">No detailed description provided.</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {product.certification_url && (
                                        <Card className="bg-white/5 border-white/10 text-white">
                                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                                <div className="p-2 bg-[#C6A85E]/10 rounded-lg">
                                                    <Award className="w-6 h-6 text-[#C6A85E]" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">Certifications</CardTitle>
                                                    <CardDescription>Official certifications for this product</CardDescription>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <a href={product.certification_url} target="_blank" rel="noopener noreferrer" className="text-[#C6A85E] hover:underline flex items-center gap-2">
                                                    View Certifications <ArrowUpRight className="w-4 h-4" />
                                                </a>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>

                                <TabsContent value="training" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    {isOwner && (
                                        <div className="flex justify-end">
                                            <AddResourceDialog productId={product.id} onSuccess={handleResourceAdded} />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Links Card */}
                                        <Card className="bg-white/5 border-white/10 text-white h-full">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <GraduationCap className="w-5 h-5 text-[#C6A85E]" />
                                                    Resources
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {product.support_url && (
                                                    <a href={product.support_url} target="_blank" className="flex items-center justify-between p-3 rounded bg-white/5 hover:bg-white/10 transition-colors group">
                                                        <span className="text-gray-300">Support Portal</span>
                                                        <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white" />
                                                    </a>
                                                )}
                                                {product.course_url && (
                                                    <a href={product.course_url} target="_blank" className="flex items-center justify-between p-3 rounded bg-white/5 hover:bg-white/10 transition-colors group">
                                                        <span className="text-gray-300">Training Course</span>
                                                        <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white" />
                                                    </a>
                                                )}
                                                {!product.support_url && !product.course_url && officialResources.filter(r => r.type !== 'youtube').length === 0 && (
                                                    <p className="text-gray-500 italic">No resource links provided.</p>
                                                )}
                                                {officialResources.filter(r => r.type !== 'youtube').map((resource, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 rounded bg-white/5 hover:bg-white/10 transition-colors group">
                                                        <a href={resource.url} target="_blank" className="flex items-center gap-3 flex-1">
                                                            {getResourceIcon(resource.type)}
                                                            <span className="text-gray-300 hover:text-white transition-colors">{resource.title}</span>
                                                            <ArrowUpRight className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </a>
                                                        {isOwner && (
                                                            <div className="flex items-center gap-1">
                                                                <EditResourceDialog resource={resource} onSuccess={handleResourceAdded} />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                                                                    onClick={() => handleDeleteResource(resource.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>

                                        {/* Videos Card */}
                                        {((product.training_video_urls || []).length > 0 || officialResources.filter(r => r.type === 'youtube').length > 0) && (
                                            <Card className="bg-white/5 border-white/10 text-white col-span-1 md:col-span-2">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Video className="w-5 h-5 text-[#C6A85E]" />
                                                        Training Videos
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-6">
                                                        {product.training_video_urls.map((url: string, i: number) => (
                                                            <div key={i} className="aspect-video rounded-lg overflow-hidden bg-black/40 border border-white/10 relative group">
                                                                <iframe
                                                                    width="100%"
                                                                    height="100%"
                                                                    src={url.replace("watch?v=", "embed/")}
                                                                    title={`Training Video ${i + 1}`}
                                                                    frameBorder="0"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                />
                                                                {isOwner && (
                                                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-lg p-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                                                                            onClick={() => handleDeleteTrainingVideo(url)}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {officialResources.filter(r => r.type === 'youtube').map((resource, i) => (
                                                            <div key={`new-${i}`} className="aspect-video rounded-lg overflow-hidden bg-black/40 border border-white/10 relative group">
                                                                <iframe
                                                                    width="100%"
                                                                    height="100%"
                                                                    src={resource.url.replace("watch?v=", "embed/")}
                                                                    title={resource.title}
                                                                    frameBorder="0"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                />
                                                                <div className="p-2 bg-[#121212] text-xs text-gray-400 truncate">
                                                                    {resource.title}
                                                                </div>
                                                                {isOwner && (
                                                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-lg p-1">
                                                                        <EditResourceDialog resource={resource} onSuccess={handleResourceAdded} />
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                                                                            onClick={() => handleDeleteResource(resource.id)}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="community" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-white">Community Resources</h3>
                                        {mounted && (
                                            <Dialog open={isAddVideoOpen} onOpenChange={setIsAddVideoOpen}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" className="bg-[#C6A85E] hover:bg-[#B5964A] text-black">
                                                        <Plus className="w-4 h-4 mr-2" /> Add Video
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-[#1F1F1F] border-white/10 text-white sm:max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>Add YouTube Video</DialogTitle>
                                                        <DialogDescription className="text-gray-400">
                                                            Share a helpful video with the community.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <form onSubmit={handleAddVideo} className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="video-title">Title</Label>
                                                            <Input
                                                                id="video-title"
                                                                placeholder="e.g. How to get started tutorial"
                                                                value={newVideoTitle}
                                                                onChange={(e) => setNewVideoTitle(e.target.value)}
                                                                className="bg-white/5 border-white/10 text-white"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="video-url">YouTube URL</Label>
                                                            <Input
                                                                id="video-url"
                                                                placeholder="https://youtube.com/watch?v=..."
                                                                value={newVideoUrl}
                                                                onChange={(e) => setNewVideoUrl(e.target.value)}
                                                                className="bg-white/5 border-white/10 text-white"
                                                            />
                                                        </div>
                                                        <DialogFooter>
                                                            <Button type="button" variant="ghost" onClick={() => setIsAddVideoOpen(false)}>Cancel</Button>
                                                            <Button type="submit" disabled={isAddingVideo} className="bg-[#C6A85E] hover:bg-[#B5964A] text-black">
                                                                {isAddingVideo ? "Adding..." : "Add Video"}
                                                            </Button>
                                                        </DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {isLoadingCommunity ? (
                                            <div className="py-12 text-center text-gray-500">
                                                Loading community resources...
                                            </div>
                                        ) : resources.length > 0 ? (
                                            resources.map((resource: any, index: number) => {
                                                const youtubeId = getYouTubeId(resource.url);
                                                const isVideo = youtubeId !== null;

                                                return (
                                                    <div key={resource.id} className={cn(
                                                        "group",
                                                        index !== resources.length - 1 && "border-b border-white/5 pb-8 mb-8"
                                                    )}>
                                                        {isVideo ? (
                                                            <div className="space-y-4">
                                                                <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-2xl">
                                                                    <iframe
                                                                        width="100%"
                                                                        height="100%"
                                                                        src={`https://www.youtube.com/embed/${youtubeId}`}
                                                                        title={resource.title}
                                                                        frameBorder="0"
                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                        allowFullScreen
                                                                        className="w-full h-full"
                                                                    ></iframe>
                                                                </div>

                                                                <div className="flex items-start justify-between gap-4 px-1">
                                                                    <div className="min-w-0 flex-grow">
                                                                        <h4 className="text-lg font-semibold text-white mb-1 leading-tight">
                                                                            {resource.title}
                                                                        </h4>
                                                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                                                            <span className="hover:text-white transition-colors cursor-default">
                                                                                Added by {resource.profiles?.full_name || 'Unknown'}
                                                                            </span>
                                                                            <span>•</span>
                                                                            <span>{format(new Date(resource.created_at), 'MMM d, yyyy')}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleUpvote(resource.id)}
                                                                            className={cn(
                                                                                "flex items-center gap-2 h-9 px-3 rounded-lg border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all",
                                                                                resource.is_upvoted && "text-[#C6A85E] border-[#C6A85E]/30 bg-[#C6A85E]/5 hover:text-[#C6A85E] hover:bg-[#C6A85E]/10",
                                                                                animatingResources[resource.id] && "animate-upvote-pop"
                                                                            )}
                                                                        >
                                                                            <ArrowBigUp className={cn("w-5 h-5", resource.is_upvoted && "fill-current")} />
                                                                            <span className="font-semibold">{resource.upvotes_count || 0}</span>
                                                                        </Button>

                                                                        {(isOwner || (user && resource.created_by === user.id)) && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => handleDeleteCommunityResource(resource.id)}
                                                                                className="h-9 w-9 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-4 items-start p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                                {/* Thumbnail for non-video */}
                                                                <div className="flex-shrink-0">
                                                                    <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center border border-blue-500/20">
                                                                        <Globe className="w-6 h-6 text-blue-500" />
                                                                    </div>
                                                                </div>

                                                                {/* Content for non-video */}
                                                                <div className="flex-grow min-w-0">
                                                                    <div className="flex items-start justify-between gap-4">
                                                                        <div className="min-w-0">
                                                                            <h4 className="text-base font-semibold text-white truncate mb-1">
                                                                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#C6A85E] transition-colors">
                                                                                    {resource.title}
                                                                                </a>
                                                                            </h4>
                                                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                                <span>Added by {resource.profiles?.full_name || 'Unknown'}</span>
                                                                                <span>•</span>
                                                                                <span>{format(new Date(resource.created_at), 'MMM d, yyyy')}</span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-2 shrink-0">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleUpvote(resource.id)}
                                                                                className={cn(
                                                                                    "flex items-center gap-1.5 h-8 px-2 text-gray-400 hover:text-white hover:bg-white/10",
                                                                                    resource.is_upvoted && "text-[#C6A85E] hover:text-[#C6A85E] bg-[#C6A85E]/10",
                                                                                    animatingResources[resource.id] && "animate-upvote-pop"
                                                                                )}
                                                                            >
                                                                                <ArrowBigUp className={cn("w-5 h-5", resource.is_upvoted && "fill-current")} />
                                                                                <span className="text-xs font-medium">{resource.upvotes_count || 0}</span>
                                                                            </Button>

                                                                            {(isOwner || (user && resource.created_by === user.id)) && (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => handleDeleteCommunityResource(resource.id)}
                                                                                    className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="py-12 text-center border border-dashed border-white/10 rounded-lg">
                                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Video className="w-6 h-6 text-gray-500" />
                                                </div>
                                                <h3 className="text-lg font-medium text-white">No videos yet</h3>
                                                <p className="text-gray-500 mb-4">Be the first to share a video for this community.</p>
                                                <Button size="sm" onClick={() => setIsAddVideoOpen(true)} className="bg-[#C6A85E] hover:bg-[#B5964A] text-black">
                                                    <Plus className="w-4 h-4 mr-2" /> Add Video
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>




                            </div>
                        </Tabs>
                    </div>

                    {/* Sidebar (Right, 1 col) */}
                    <div className="space-y-6">
                        {/* Product Users Sidebar */}
                        <Card className="bg-white/5 border-white/10 text-white">
                            <CardHeader className="pb-3 border-b border-white/10 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="w-5 h-5 text-[#C6A85E]" />
                                    Product Users
                                </CardTitle>
                                {!isExpert && (
                                    <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" className="h-8 border-[#C6A85E]/50 text-[#C6A85E] hover:bg-[#C6A85E]/10">
                                                Join
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-[#1F1F1F] border-white/10 text-white sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Join Product Community</DialogTitle>
                                                <DialogDescription className="text-gray-400">
                                                    Tell us about your experience level with this product.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <Select onValueChange={setExpertiseLevel}>
                                                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder="Select expertise level" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1F1F1F] border-white/10 text-white">
                                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                                        <SelectItem value="Certified">Certified</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    onClick={handleJoinExperts}
                                                    disabled={isJoining}
                                                    className="bg-[#C6A85E] text-black hover:bg-[#B5964A] w-full"
                                                >
                                                    {isJoining ? "Joining..." : "Join Community"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}
                                {isExpert && (
                                    <>
                                        <Button
                                            onClick={() => setIsLeaveDialogOpen(true)}
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            Leave
                                        </Button>

                                        <ConfirmDialog
                                            open={isLeaveDialogOpen}
                                            onOpenChange={setIsLeaveDialogOpen}
                                            title="Leave Product Community"
                                            description="Are you sure you want to leave? You will be removed from the product users list."
                                            confirmText="Yes, leave"
                                            cancelText="Cancel"
                                            onConfirm={handleLeaveExperts}
                                            variant="destructive"
                                            loading={isJoining}
                                        />
                                    </>
                                )}
                            </CardHeader>
                            <CardContent className="pt-4">
                                {isLoadingCommunity ? (
                                    <div className="text-center text-gray-500 py-4">Loading...</div>
                                ) : experts.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar space-y-3">
                                            {experts.map((expert: any) => (
                                                <div key={expert.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold shrink-0 text-xs overflow-hidden">
                                                        {expert.profile?.avatar_url ? (
                                                            <Image
                                                                src={expert.profile.avatar_url}
                                                                alt={expert.profile.full_name || "User"}
                                                                width={32}
                                                                height={32}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        ) : (
                                                            expert.profile?.full_name?.charAt(0) || <Users className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1">
                                                            <h4 className="font-medium text-white text-sm truncate">
                                                                {expert.profile?.full_name || "Unknown User"}
                                                            </h4>
                                                            {expert.is_verified && (
                                                                <CheckCircle className="w-3 h-3 text-[#C6A85E]" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-400 truncate">
                                                            {expert.expertise_level && (
                                                                <span className="text-[#C6A85E] mr-1">[{expert.expertise_level}]</span>
                                                            )}
                                                            {expert.profile?.headline || "Product User"}
                                                        </p>
                                                    </div>
                                                    {isOwner && (
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleRemoveExpert(expert.user_id)}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {!isExpert && (
                                            <div className="text-center text-gray-400 py-2 text-xs mt-2 border-t border-white/5 pt-3">
                                                If you are a user of <span className="text-white font-medium">{product.name}</span>, register now!
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-4 text-sm">
                                        If you are a user of <span className="text-white font-medium">{product.name}</span>, Be the first to register!
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Commercial / Pricing Info */}
                        <Card className="bg-white/5 border-white/10 text-white">
                            <CardHeader className="pb-3 border-b border-white/10">
                                <CardTitle className="text-lg text-[#C6A85E]">Pricing & Availability</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="flex justify-between border-b border-white/10 pb-3 text-sm">
                                    <span className="text-gray-400">Status</span>
                                    <span className="font-medium text-white">{product.availability_status || "Unknown"}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-3 text-sm">
                                    <span className="text-gray-400">Pricing Model</span>
                                    <span className="font-medium text-white">{product.pricing_model || "Not specified"}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-400 text-sm">Price</span>
                                    <span className="text-xl font-bold text-white">
                                        {product.price_upon_request ? (
                                            "Upon Request"
                                        ) : (
                                            `${product.price || 0} ${product.currency}`
                                        )}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-[#C6A85E]/20 to-black border-[#C6A85E]/30 text-white">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Request Quote</CardTitle>
                                <CardDescription className="text-gray-400 text-xs mt-1">
                                    Interested in {product.name}? Contact the organization directly.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Button className="w-full bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold h-10">
                                    Contact Sales
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Organization Info / Owner Tips */}
                        {isOwner ? (
                            <Card className="bg-[#C6A85E]/10 border-[#C6A85E]/20 text-white sticky top-24">
                                <CardHeader className="pb-3 border-b border-[#C6A85E]/10">
                                    <CardTitle className="text-lg flex items-center gap-2 text-[#C6A85E]">
                                        <Lightbulb className="w-5 h-5" />
                                        Owner Tips
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="bg-[#C6A85E]/20 p-2.5 rounded-lg shrink-0 mt-1">
                                            <QrCode className="w-5 h-5 text-[#C6A85E]" />
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            <span className="text-white font-medium block mb-1">Boost Engagement</span>
                                            Download the QR code and place it on your product during events. Get real-time notifications from visitors who scan it so you can reach them right away.
                                        </p>
                                    </div>

                                    <div className="flex gap-4 items-start">
                                        <div className="bg-[#C6A85E]/20 p-2.5 rounded-lg shrink-0 mt-1">
                                            <Bookmark className="w-5 h-5 text-[#C6A85E]" />
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            <span className="text-white font-medium block mb-1">Track Interest</span>
                                            Check the list of bookmarked users to reach out to potential leads who have shown interest in your product.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center h-[300px] sticky top-24">
                                <span className="text-white/20 font-medium">Advertisement Space</span>
                                <span className="text-white/10 text-sm mt-1">300 x 300</span>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
}
