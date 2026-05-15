import Link from "next/link";
import { Plus } from "lucide-react";
import { listAdminProducts } from "@/features/admin/server/actions";
import { AdminProductRow } from "./product-row";
import { Button } from "@/components/ui/button";

export default async function AdminProductsPage() {
    const products = await listAdminProducts();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="text-sm text-gray-400 mt-1">{products.length} most recent</p>
                </div>
                <Link href="/admin/products/new">
                    <Button className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold gap-2">
                        <Plus className="h-4 w-4" />
                        Add Platform Product
                    </Button>
                </Link>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                            <th className="text-left p-4 font-medium">Product</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-right p-4 font-medium">Views</th>
                            <th className="text-right p-4 font-medium">Bookmarks</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No products found
                                </td>
                            </tr>
                        ) : (
                            products.map((p) => <AdminProductRow key={p.id} product={p} />)
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
