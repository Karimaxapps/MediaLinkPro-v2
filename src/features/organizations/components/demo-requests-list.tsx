"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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

type RequestStatus = "pending" | "contacted" | "ignored";
type RequestType = "demo" | "quote";

type OrganizationRequest = {
    id: string;
    created_at: string;
    request_type: RequestType | null;
    status: RequestStatus;
    contact_name: string;
    contact_email: string;
    contact_phone: string | null;
    company_name: string | null;
    message: string | null;
    products: {
        name: string | null;
        slug: string | null;
    } | null;
};

export function DemoRequestsList({ organizationId }: DemoRequestsListProps) {
    const t = useTranslations("companies");
    const [requests, setRequests] = useState<OrganizationRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const data = await getOrganizationRequests(organizationId);
            setRequests((data || []) as OrganizationRequest[]);
        } catch (error) {
            console.error("Failed to fetch requests", error);
            toast.error(t("failedLoad"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [organizationId]);

    const handleStatusUpdate = async (id: string, newStatus: RequestStatus) => {
        try {
            const result = await updateRequestStatus(id, newStatus);
            if (result.success) {
                toast.success(t("requestMarkedAs", { status: t(`reqStatuses.${newStatus}`).toLowerCase() }));
                fetchRequests(); // Refresh list
            } else {
                toast.error(t("failedUpdateStatus"));
            }
        } catch (error) {
            toast.error(t("errorOccurred"));
        }
    };

    if (isLoading) {
        return <div className="text-gray-400 text-center py-8">{t("loadingRequests")}</div>;
    }

    if (requests.length === 0) {
        return (
            <EmptyState
                icon={Mail}
                title={t("noRequestsTitle")}
                description={t("noRequestsDesc")}
            />
        );
    }

    return (
        <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
                <CardTitle>{t("requestsTitle")}</CardTitle>
                <CardDescription>{t("requestsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-gray-400">{t("date")}</TableHead>
                            <TableHead className="text-gray-400">{t("type")}</TableHead>
                            <TableHead className="text-gray-400">{t("product")}</TableHead>
                            <TableHead className="text-gray-400">{t("contact")}</TableHead>
                            <TableHead className="text-gray-400">{t("status")}</TableHead>
                            <TableHead className="text-right text-gray-400">{t("actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id} className="border-white/10 hover:bg-white/5">
                                <TableCell className="text-gray-300">
                                    {format(new Date(request.created_at), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={
                                            request.request_type === 'quote'
                                                ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                                : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                                        }
                                    >
                                        {request.request_type === 'quote' ? t("quote") : t("demo")}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-white">
                                    {request.products?.name || t("unknownProduct")}
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
                                                    "bg-[var(--brand)]/10 text-[var(--brand)] hover:bg-[var(--brand)]/20"
                                        }
                                    >
                                        {t(`reqStatuses.${request.status}`)}
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
                                                {t("done")}
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

function ViewRequestDialog({ request }: { request: OrganizationRequest }) {
    const t = useTranslations("companies");
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-gray-400 hover:text-white hover:bg-white/10">
                    {t("view")}
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1F1F1F] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("requestDetails")}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {t("submittedOn", { date: format(new Date(request.created_at), 'PPpp') })}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase">{t("product")}</h4>
                            <p className="text-white font-medium">{request.products?.name}</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase">{t("status")}</h4>
                            <Badge variant="outline" className="border-white/10 text-gray-300">
                                {t(`reqStatuses.${request.status}`)}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-white/10">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white/5 rounded-lg shrink-0">
                                <Building2 className="w-4 h-4 text-[var(--brand)]" />
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase">{t("contactInfo")}</h4>
                                <p className="text-white font-medium">{request.contact_name}</p>
                                {request.company_name && <p className="text-gray-400 text-sm">{request.company_name}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-lg shrink-0">
                                <Mail className="w-4 h-4 text-[var(--brand)]" />
                            </div>
                            <a href={`mailto:${request.contact_email}`} className="text-[var(--brand)] hover:underline text-sm">
                                {request.contact_email}
                            </a>
                        </div>

                        {request.contact_phone && (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg shrink-0">
                                    <Phone className="w-4 h-4 text-[var(--brand)]" />
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
                            <h4 className="text-xs font-semibold text-gray-500 uppercase">{t("message")}</h4>
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
