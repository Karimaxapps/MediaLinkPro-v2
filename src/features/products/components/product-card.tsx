'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Product } from "../types";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
    product: Product;
    compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
    return (
        <Link
            href={`/products/${product.slug}`}
            className="group block h-full"
        >
            <Card className="bg-white/5 border-white/10 overflow-hidden hover:border-[#C6A85E]/50 transition-all duration-300 h-full flex flex-col p-0 gap-0 relative">
                <CardHeader className="p-0">
                    <div className={`relative w-full bg-gray-900 group-hover:opacity-90 transition-opacity overflow-hidden ${compact ? "h-32" : "h-48"}`}>
                        {(product.gallery_urls && product.gallery_urls.length > 0) || product.logo_url ? (
                            <img
                                src={product.gallery_urls?.[0] || product.logo_url || ""}
                                alt={product.name}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                                <span className="text-gray-500 font-medium text-xs">No Image</span>
                            </div>
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                        <Badge
                            variant="secondary"
                            className={`absolute bg-black/50 backdrop-blur-md text-white border border-white/10 ${compact ? "top-2 right-2 text-[10px] px-1.5 py-0" : "top-3 right-3"}`}
                        >
                            {product.product_type}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className={`flex-1 flex flex-col justify-between ${compact ? "p-3 space-y-2" : "p-4 space-y-4"}`}>
                    <div className={compact ? "space-y-1" : "space-y-2"}>
                        <h3 className={`font-bold text-white group-hover:text-[#C6A85E] transition-colors line-clamp-1 ${compact ? "text-sm" : "text-lg"}`}>
                            {product.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <span className="font-medium text-gray-300 truncate">{product.main_category}</span>
                            {product.sub_category && !compact && (
                                <>
                                    <span className="text-gray-600">•</span>
                                    <span className="truncate">{product.sub_category}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={`mt-auto border-t border-white/5 flex items-center justify-between ${compact ? "pt-2" : "pt-4"}`}>
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[10px] text-gray-500 shrink-0">By:</span>
                            <span className={`font-medium text-gray-300 truncate ${compact ? "text-xs max-w-[90px]" : "text-sm max-w-[150px]"}`}>
                                {product.organizations?.name || "Unknown Company"}
                            </span>
                        </div>

                        {product.organizations?.logo_url ? (
                            <img
                                src={product.organizations.logo_url}
                                alt={product.organizations.name}
                                className={`object-contain shrink-0 ${compact ? "h-6 w-6" : "h-8 w-8"}`}
                            />
                        ) : (
                            <div className={`rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0 ${compact ? "h-6 w-6" : "h-8 w-8"}`}>
                                <span className="text-[10px] font-bold text-gray-500">
                                    {product.organizations?.name?.substring(0, 2).toUpperCase() || "??"}
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
