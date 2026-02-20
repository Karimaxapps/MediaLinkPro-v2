"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getProductDemoRequests } from "@/features/products/server/actions";
import { useEffect, useState } from "react";
import { Loader2, User, Mail, Phone, Calendar, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface DemoRequestsDialogProps {
    productId: string;
    children: React.ReactNode;
}

export function DemoRequestsDialog({ productId, children }: DemoRequestsDialogProps) {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            const fetchRequests = async () => {
                setLoading(true);
                try {
                    const data = await getProductDemoRequests(productId);
                    setRequests(data || []);
                } catch (error) {
                    console.error("Failed to fetch requests", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchRequests();
        }
    }, [open, productId]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="bg-[#1C1C1C] border-white/10 text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Demo Requests</span>
                        <Badge variant="secondary" className="bg-[#C6A85E]/20 text-[#C6A85E] hover:bg-[#C6A85E]/30">
                            {requests.length} Requests
                        </Badge>
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[500px] pr-4 w-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[#C6A85E]" />
                            <p className="text-gray-400">Loading requests...</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                <Mail className="w-6 h-6 text-gray-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-medium text-white">No requests yet</p>
                                <p className="text-sm text-gray-500">
                                    When users request a demo, they will appear here.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <div key={request.id} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 hover:border-white/20 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#C6A85E]/20 flex items-center justify-center text-[#C6A85E] shrink-0">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white text-base">{request.contact_name}</h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-400 mt-0.5">
                                                    <Building2 className="w-3.5 h-3.5" />
                                                    <span>{request.company_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-md">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2.5 text-gray-300 bg-black/20 p-2.5 rounded-lg">
                                            <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0">
                                                <Mail className="w-3.5 h-3.5 text-[#C6A85E]" />
                                            </div>
                                            <span className="truncate">{request.contact_email}</span>
                                        </div>
                                        {request.contact_phone && (
                                            <div className="flex items-center gap-2.5 text-gray-300 bg-black/20 p-2.5 rounded-lg">
                                                <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0">
                                                    <Phone className="w-3.5 h-3.5 text-[#C6A85E]" />
                                                </div>
                                                <span>{request.contact_phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    {request.message && (
                                        <div className="bg-black/30 rounded-lg p-3.5 text-sm text-gray-300 relative border border-white/5">
                                            <div className="absolute top-3 left-0 w-1 h-full bg-[#C6A85E]/50 rounded-r-full" />
                                            {request.message}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
