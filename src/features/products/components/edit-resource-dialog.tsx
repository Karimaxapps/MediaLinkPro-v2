import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Loader2, Globe, Youtube, GraduationCap, FileText, Award } from "lucide-react";
import { toast } from "sonner";
import { updateProductResource } from "../server/actions";

interface EditResourceDialogProps {
    resource: {
        id: string;
        title: string;
        url: string;
        type: "official_link" | "shopping" | "training" | "youtube" | "documentation" | "certification";
    };
    onSuccess: () => void;
}

export function EditResourceDialog({ resource, onSuccess }: EditResourceDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: resource.title,
        url: resource.url,
        type: resource.type
    });

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10">
                <Edit className="w-4 h-4" />
            </Button>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await updateProductResource(resource.id, formData);

            if (result.success) {
                toast.success("Resource updated successfully");
                setIsOpen(false);
                onSuccess();
            } else {
                toast.error(result.error || "Failed to update resource");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10">
                    <Edit className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Resource</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Resource Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                                <SelectItem value="official_link">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-blue-400" />
                                        <span>Official Link</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="youtube">
                                    <div className="flex items-center gap-2">
                                        <Youtube className="w-4 h-4 text-red-500" />
                                        <span>YouTube Video</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="training">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-green-400" />
                                        <span>Training Course</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="documentation">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-orange-400" />
                                        <span>Documentation</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="certification">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-yellow-400" />
                                        <span>Certification</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            className="bg-white/5 border-white/10"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                            id="url"
                            type="url"
                            className="bg-white/5 border-white/10"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            disabled={isLoading}
                            className="text-gray-400 hover:bg-white hover:text-black"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#C6A85E] text-black hover:bg-[#B5964A]"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
