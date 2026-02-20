import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActivityItem } from "@/features/organizations/server/dashboard-actions";
import { formatDistanceToNow } from "date-fns";
import { UserCheck, FileText } from "lucide-react";

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
    return (
        <Card className="bg-white/5 border-white/10 text-white h-full">
            <CardHeader>
                <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {activities.length === 0 ? (
                        <p className="text-gray-500 text-sm">No recent activity.</p>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex items-start">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={activity.user?.avatar_url || ""} alt={activity.user?.name} />
                                    <AvatarFallback className="bg-[#C6A85E] text-black font-medium">
                                        {activity.user?.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none text-white">
                                        {activity.user?.name}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">
                                    {activity.type === 'new_expert' ? (
                                        <UserCheck className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <FileText className="h-4 w-4 text-blue-500" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
