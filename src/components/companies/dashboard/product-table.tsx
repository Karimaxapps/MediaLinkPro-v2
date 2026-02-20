"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductWithStats } from "@/features/organizations/server/dashboard-actions";
import { Eye, Bookmark, Scan, FileText, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ProductTable({ products }: { products: ProductWithStats[] }) {
    const router = useRouter();
    return (
        <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
                <CardTitle className="text-lg font-medium">Product Listing</CardTitle>
                <CardAction>
                    <Button onClick={() => router.push('/products/new')} size="sm" className="bg-[#C6A85E] hover:bg-[#B5974D] text-black">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Product
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-white/10">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-white/5 text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Demo Requests</th>
                                <th className="px-6 py-3">Views</th>
                                <th className="px-6 py-3">Bookmarks</th>
                                <th className="px-6 py-3">Scans</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr
                                        key={product.id}
                                        onClick={() => router.push(`/products/${product.slug}`)}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 font-medium text-white">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant={product.status === 'published' ? 'default' : 'secondary'}
                                                className={`${product.status === 'published' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'} capitalize`}
                                            >
                                                {product.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-blue-400" />
                                                <span>{product.demoRequestsCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Eye className="h-4 w-4 text-gray-400" />
                                                <span>{product.views}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Bookmark className="h-4 w-4 text-gray-400" />
                                                <span>{product.bookmarks}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Scan className="h-4 w-4 text-gray-400" />
                                                <span>{product.scans}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
