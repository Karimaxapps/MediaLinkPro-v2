'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Product } from "../types";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Link
            href={`/products/${product.slug}`}
            className="group block h-full"
        >
            <Card className="bg-white/5 border-white/10 overflow-hidden hover:border-[#C6A85E]/50 transition-all duration-300 h-full flex flex-col p-0 gap-0 relative">
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
                        <h3 className="font-bold text-lg text-white group-hover:text-[#C6A85E] transition-colors line-clamp-1">
                            {product.name}
                        </h3>

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

                    <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">By:</span>
                            <span className="text-sm font-medium text-gray-300 truncate max-w-[150px]">
                                {product.organizations?.name || "Unknown Company"}
                            </span>
                        </div>

                        {product.organizations?.logo_url ? (
                            <img
                                src={product.organizations.logo_url}
                                alt={product.organizations.name}
                                className="h-8 w-8 object-contain"
                            />
                        ) : (
                            <div className="h-8 w-8 rounded bg-white/5 border border-white/10 flex items-center justify-center">
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
