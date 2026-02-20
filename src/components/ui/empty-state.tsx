import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white/5 border border-white/10 rounded-lg border-dashed">
            <div className="bg-white/10 p-3 rounded-full mb-4">
                <Icon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-400 max-w-sm mb-6">{description}</p>
            {actionLabel && (
                <Button onClick={onAction} className="bg-[#C6A85E] hover:bg-[#B5964A] text-black">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
