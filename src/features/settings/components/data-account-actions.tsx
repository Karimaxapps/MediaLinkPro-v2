"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Trash2, AlertTriangle } from "lucide-react";
import { requestDataExport, deleteAccount } from "../server/actions";

export function DataAccountActions() {
    const router = useRouter();
    const [isExporting, startExport] = useTransition();
    const [isDeleting, startDelete] = useTransition();
    const [confirmation, setConfirmation] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

    const handleExport = () => {
        startExport(async () => {
            const result = await requestDataExport();
            if (!result.success) {
                toast.error(result.error ?? "Export failed");
                return;
            }
            const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `medialinkpro-export-${new Date().toISOString().split("T")[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Data export ready");
        });
    };

    const handleDelete = () => {
        startDelete(async () => {
            const result = await deleteAccount(confirmation);
            if (!result.success) {
                toast.error(result.error ?? "Failed to delete account");
                return;
            }
            toast.success("Account deleted. Signing out...");
            router.push("/");
        });
    };

    return (
        <div className="space-y-6">
            {/* Export */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h4 className="text-sm font-medium text-white flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export Your Data
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                            Download a copy of your profile, products, messages, connections, and reviews (GDPR).
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="border-white/10 hover:bg-white/10"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? "Preparing..." : "Export"}
                    </Button>
                </div>
            </div>

            {/* Delete */}
            <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/20 space-y-3">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">Delete Account</h4>
                        <p className="text-xs text-gray-500 mt-1">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                    </div>
                </div>
                {!showConfirm ? (
                    <Button
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => setShowConfirm(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete My Account
                    </Button>
                ) : (
                    <div className="space-y-3 pt-2">
                        <p className="text-xs text-gray-400">
                            Type <code className="text-red-400 font-mono">DELETE</code> to confirm:
                        </p>
                        <Input
                            value={confirmation}
                            onChange={(e) => setConfirmation(e.target.value)}
                            placeholder="DELETE"
                            className="bg-white/5 border-white/10"
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="border-white/10"
                                onClick={() => {
                                    setShowConfirm(false);
                                    setConfirmation("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={handleDelete}
                                disabled={isDeleting || confirmation !== "DELETE"}
                            >
                                {isDeleting ? "Deleting..." : "Confirm Delete"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
