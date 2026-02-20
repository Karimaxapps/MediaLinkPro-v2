'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "../types";
import { Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteProduct } from "../server/actions";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

interface CompanyProductCardProps {
    product: Product;
}

export function CompanyProductCard({ product }: CompanyProductCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteProduct(product.id);
            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Failed to delete product");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <>
            <Card className="bg-white/5 border-white/10 overflow-hidden hover:border-[#C6A85E]/50 transition-all duration-300 h-full flex flex-col p-0 gap-0 relative group">
                <Link href={`/products/${product.slug}`} className="flex-1 flex flex-col group cursor-pointer">
                    <CardHeader className="p-0">
                        <div className="relative h-48 w-full bg-gray-900 group-hover:opacity-90 transition-opacity overflow-hidden">
                            {(product.gallery_urls && product.gallery_urls.length > 0) || product.logo_url ? (
                                <img
                                    src={product.gallery_urls?.[0] || product.logo_url || ""}
                                    alt={product.name}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                                    <span className="text-gray-500 font-medium">No Image</span>
                                </div>
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                            <Badge
                                variant="secondary"
                                className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white border border-white/10"
                            >
                                {product.product_type}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-bold text-lg text-white group-hover:text-[#C6A85E] transition-colors line-clamp-1">
                                    {product.name}
                                </h3>
                                {/* Total Views Badge */}
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md border border-white/5 whitespace-nowrap">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span className="font-mono">{product.views || 0}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="font-medium text-gray-300">{product.main_category}</span>
                                {product.sub_category && (
                                    <>
                                        <span className="text-gray-600">•</span>
                                        <span>{product.sub_category}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Link>

                <div className="px-4 pb-4 mt-auto">
                    <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-[#C6A85E]"
                            asChild
                        >
                            <Link href={`/products/${product.slug}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            </Card>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="bg-[#1A1F26] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="w-5 h-5" />
                            Delete Product?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete "{product.name}"? This action cannot be undone and will permanently remove this product and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? "Deleting..." : "Delete Permanently"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
