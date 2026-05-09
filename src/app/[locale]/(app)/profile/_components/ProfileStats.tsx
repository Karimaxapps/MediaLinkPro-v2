"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatItemProps {
    label: string;
    value: string;
    trend?: string;
    progress: number;
}

function StatItem({ label, value, trend, progress }: StatItemProps) {
    return (
        <Card className="bg-white/5 border-white/10 overflow-hidden group hover:border-[#C6A85E]/30 transition-all duration-300">
            <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                    {trend && (
                        <span className={cn(
                            "text-xs font-bold",
                            trend.startsWith('+') ? "text-green-500" : "text-gray-500"
                        )}>
                            {trend}
                        </span>
                    )}
                </div>

                <h3 className="text-4xl font-bold text-white tracking-tighter">
                    {value}
                </h3>

                <div className="space-y-1.5 pt-2">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#C6A85E] rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(198,168,94,0.3)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ProfileStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatItem
                label="Followers"
                value="1,248"
                trend="+12%"
                progress={65}
            />
            <StatItem
                label="Following"
                value="850"
                trend="Steady"
                progress={45}
            />
            <StatItem
                label="Active Projects"
                value="42"
                trend="+3 new"
                progress={80}
            />
        </div>
    );
}
