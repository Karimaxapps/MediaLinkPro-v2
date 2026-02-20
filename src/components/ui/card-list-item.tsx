import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CardListItemProps {
    title: string;
    subtitle?: string;
    description?: string;
    imageSrc?: string;
    location?: string;
    tags?: string[];
    href: string;
    verified?: boolean;
}

export function CardListItem({ title, subtitle, description, imageSrc, location, tags, href, verified }: CardListItemProps) {
    return (
        <Card className="bg-white/5 border-white/10 text-white overflow-hidden hover:bg-white/10 transition-colors group">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border border-white/10 rounded-lg">
                        <AvatarImage src={imageSrc} alt={title} className="object-cover" />
                        <AvatarFallback className="bg-white/10 text-xl font-bold rounded-lg">{title.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                    {title}
                                    {verified && <Badge variant="secondary" className="bg-[#C6A85E] text-black hover:bg-[#B5964A] text-[10px] h-5 px-1.5">VERIFIED</Badge>}
                                </CardTitle>
                                {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
                            </div>
                        </div>

                        {description && (
                            <p className="text-sm text-gray-300 line-clamp-2">
                                {description}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2">
                            {location && (
                                <div className="flex items-center text-xs text-gray-500 mr-2">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    {location}
                                </div>
                            )}
                            {tags?.map((tag) => (
                                <Badge key={tag} variant="outline" className="border-white/10 text-gray-400 text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="self-center">
                        <Link href={href}>
                            <Button variant="ghost" className="text-[#C6A85E] hover:text-white hover:bg-white/10 group-hover:translate-x-1 transition-transform">
                                View <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
