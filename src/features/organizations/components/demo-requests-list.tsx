"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CheckCircle, Clock, XCircle, Mail, Phone, Building2, MessageSquare } from "lucide-react";
import { getOrganizationRequests, updateRequestStatus } from "@/features/requests/server/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";

interface DemoRequestsListProps {
    organizationId: string;
}

export function DemoRequestsList({ organizationId }: DemoRequestsListProps) {
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const data = await getOrganizationRequests(organizationId);
            setRequests(data || []);
        } catch (error) {
            console.error("Failed to fetch requests", error);
            toast.error("Failed to load requests");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [organizationId]);

    const handleStatusUpdate = async (id: string, newStatus: 'pending' | 'contacted' | 'ignored') => {
        try {
            const result = await updateRequestStatus(id, newStatus);
            if (result.success) {
                toast.success(`Request marked as ${newStatus}`);
                fetchRequests(); // Refresh list
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    if (isLoading) {
        return <div className="text-gray-400 text-center py-8">Loading requests...</div>;
    }

    if (requests.length === 0) {
        return (
            <EmptyState
                icon={Mail}
                title="No Requests Yet"
                description="When users request a demo for your products, they will appear here."
            />
        );
    }

    return (
        <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
                <CardTitle>Demo Requests</CardTitle>
                <CardDescription>Manage incoming demo requests for your products.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-gray-400">Date</TableHead>
                            <TableHead className="text-gray-400">Product</TableHead>
                            <TableHead className="text-gray-400">Contact</TableHead>
                            <TableHead className="text-gray-400">Status</TableHead>
                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id} className="border-white/10 hover:bg-white/5">
                                <TableCell className="text-gray-300">
                                    {format(new Date(request.created_at), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell className="font-medium text-white">
                                    {request.products?.name || "Unknown Product"}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium">{request.contact_name}</span>
                                        <span className="text-gray-500 text-xs">{request.company_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={
                                            request.status === 'contacted' ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" :
                                                request.status === 'ignored' ? "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20" :
                                                    "bg-[#C6A85E]/10 text-[#C6A85E] hover:bg-[#C6A85E]/20"
                                        }
                                    >
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <ViewRequestDialog request={request} />
                                        {request.status === 'pending' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 border-green-500/20 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                                                onClick={() => handleStatusUpdate(request.id, 'contacted')}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Done
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function ViewRequestDialog({ request }: { request: any }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-gray-400 hover:text-white hover:bg-white/10">
                    View
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1F1F1F] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Request Details</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Submitted on {format(new Date(request.created_at), 'PPpp')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase">Product</h4>
                            <p className="text-white font-medium">{request.products?.name}</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase">Status</h4>
                            <Badge variant="outline" className="border-white/10 text-gray-300">
                                {request.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-white/10">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white/5 rounded-lg shrink-0">
                                <Building2 className="w-4 h-4 text-[#C6A85E]" />
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase">Contact Info</h4>
                                <p className="text-white font-medium">{request.contact_name}</p>
                                {request.company_name && <p className="text-gray-400 text-sm">{request.company_name}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-lg shrink-0">
                                <Mail className="w-4 h-4 text-[#C6A85E]" />
                            </div>
                            <a href={`mailto:${request.contact_email}`} className="text-[#C6A85E] hover:underline text-sm">
                                {request.contact_email}
                            </a>
                        </div>

                        {request.contact_phone && (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg shrink-0">
                                    <Phone className="w-4 h-4 text-[#C6A85E]" />
                                </div>
                                <a href={`tel:${request.contact_phone}`} className="text-gray-300 hover:text-white text-sm">
                                    {request.contact_phone}
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            <h4 className="text-xs font-semibold text-gray-500 uppercase">Message</h4>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {request.message}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
