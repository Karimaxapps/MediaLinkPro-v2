
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle } from "lucide-react";

export default function ProductWizardPage() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Stepper Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-6 sticky top-24">
                    <h3 className="font-semibold text-white">Product Setup</h3>
                    <div className="space-y-4 relative">
                        {/* Connecting Line (Visual only) */}
                        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-white/10 -z-10" />

                        <div className="flex items-center gap-3">
                            <div className="bg-[#C6A85E] rounded-full p-0.5 z-10">
                                <CheckCircle2 className="h-4 w-4 text-black" />
                            </div>
                            <span className="text-[#C6A85E] font-medium text-sm">Basic Info</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-[#0B0F14] border border-[#C6A85E] rounded-full p-0.5 z-10">
                                <Circle className="h-4 w-4 text-[#C6A85E]" />
                            </div>
                            <span className="text-white font-medium text-sm">Media & Assets</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-[#0B0F14] border border-gray-600 rounded-full p-0.5 z-10">
                                <Circle className="h-4 w-4 text-gray-600" />
                            </div>
                            <span className="text-gray-400 text-sm">Technical Specs</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-[#0B0F14] border border-gray-600 rounded-full p-0.5 z-10">
                                <Circle className="h-4 w-4 text-gray-600" />
                            </div>
                            <span className="text-gray-400 text-sm">Review & Publish</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="lg:col-span-3 space-y-8">
                <PageHeader heading="Add Media & Assets" text="Upload images and videos for your product." />

                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader>
                        <CardTitle>Visuals</CardTitle>
                        <CardDescription className="text-gray-400">
                            High quality images increase engagement.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="border-2 border-dashed border-white/10 rounded-lg p-12 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="bg-white/10 p-4 rounded-full inline-block group-hover:bg-[#C6A85E]/20 transition-colors">
                                <span className="text-2xl text-gray-400 group-hover:text-[#C6A85E]">+</span>
                            </div>
                            <p className="mt-4 text-sm font-medium">Click to upload cover image</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                        </div>

                        <Separator className="bg-white/10" />

                        <div className="space-y-4">
                            <Label>Product Gallery</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="aspect-square bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-gray-500 text-xs">Slot 1</div>
                                <div className="aspect-square bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-gray-500 text-xs">Slot 2</div>
                                <div className="aspect-square bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-gray-500 text-xs">Slot 3</div>
                                <div className="aspect-square border border-dashed border-white/10 rounded-lg flex items-center justify-center text-gray-500 text-xs cursor-pointer hover:bg-white/5">+</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-between pt-4">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">Back</Button>
                    <Button className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold">Continue</Button>
                </div>
            </div>
        </div>
    );
}
