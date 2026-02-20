
"use client";

import { Calendar, MapPin, Building2, ExternalLink, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EventCardProps {
    name: string;
    date: string;
    location: string;
    organizer: string;
    isOnline?: boolean;
}

export function EventCard({ name, date, location, organizer, isOnline }: EventCardProps) {
    return (
        <Card className="bg-white/5 border-white/10 text-white overflow-hidden hover:bg-white/10 transition-colors">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-[#C6A85E]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Upcoming Event</span>
                </div>
                <CardTitle className="text-base font-semibold text-[#C6A85E] line-clamp-1">{name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
                <div className="space-y-1.5">
                    <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="mr-2 h-3.5 w-3.5" />
                        {date}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                        <MapPin className="mr-2 h-3.5 w-3.5" />
                        {isOnline ? "Online" : location}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                        <Building2 className="mr-2 h-3.5 w-3.5" />
                        {organizer}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs h-8 border-none">
                        Details
                    </Button>
                    <Button size="sm" variant="outline" className="px-2 bg-transparent border-white/10 hover:bg-white/5 h-8">
                        <Bookmark className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
