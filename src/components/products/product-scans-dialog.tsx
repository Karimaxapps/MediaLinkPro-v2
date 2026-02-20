"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getProductScans } from "@/features/products/server/actions";
import { useEffect, useState } from "react";
import { Loader2, User, QrCode, Monitor, Smartphone, Globe } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface ProductScansDialogProps {
    productId: string;
    children: React.ReactNode;
}

export function ProductScansDialog({ productId, children }: ProductScansDialogProps) {
    const [scans, setScans] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            const fetchScans = async () => {
                setLoading(true);
                try {
                    const data = await getProductScans(productId);
                    setScans(data || []);
                } catch (error) {
                    console.error("Failed to fetch scans", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchScans();
        }
    }, [open, productId]);

    const getDeviceIcon = (userAgent: string | null) => {
        if (!userAgent) return <Globe className="w-4 h-4" />;
        if (userAgent.toLowerCase().includes('mobile')) return <Smartphone className="w-4 h-4" />;
        return <Monitor className="w-4 h-4" />;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="bg-[#1C1C1C] border-white/10 text-white max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-[#C6A85E]/10">
                                <QrCode className="w-5 h-5 text-[#C6A85E]" />
                            </div>
                            <span>QR Scans History</span>
                        </div>
                        <Badge variant="secondary" className="bg-[#C6A85E]/20 text-[#C6A85E]">
                            {scans.length}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[500px] w-full pr-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[#C6A85E]" />
                        </div>
                    ) : scans.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center text-gray-400">
                            <p>No scans recorded yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 pt-4">
                            {scans.map((scan) => (
                                <div key={scan.id} className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        {scan.scanner ? (
                                            <Link href={`/profile/${scan.scanner.username || scan.scanner.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                                <Avatar className="h-9 w-9 border border-white/10">
                                                    <AvatarImage src={scan.scanner.avatar_url} />
                                                    <AvatarFallback className="bg-[#C6A85E]/20 text-[#C6A85E]">
                                                        {scan.scanner.full_name?.charAt(0) || <User className="w-4 h-4" />}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium text-white hover:underline">
                                                        {scan.scanner.full_name || scan.scanner.email || 'User'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {format(new Date(scan.scanned_at), 'PPP p')}
                                                    </p>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-white/10">
                                                    <AvatarFallback className="bg-white/5 text-gray-400">
                                                        <QrCode className="w-4 h-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium text-white">
                                                        Anonymous Scan
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {format(new Date(scan.scanned_at), 'PPP p')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <Badge variant="outline" className="border-white/10 text-gray-400 text-[10px] font-normal">
                                            {formatDistanceToNow(new Date(scan.scanned_at), { addSuffix: true })}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-white/5 pt-2">
                                        {scan.ip_address && (
                                            <div className="flex items-center gap-1.5">
                                                <Globe className="w-3.5 h-3.5" />
                                                <span>{scan.ip_address}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 max-w-[200px] truncate" title={scan.user_agent}>
                                            {getDeviceIcon(scan.user_agent)}
                                            <span className="truncate">{scan.user_agent || 'Unknown Device'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
