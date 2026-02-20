import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Loader2, Globe, Youtube, GraduationCap, FileText, Award } from "lucide-react";
import { toast } from "sonner";
import { addProductResource } from "../server/actions";

interface AddResourceDialogProps {
    productId: string;
    onSuccess: () => void;
}

export function AddResourceDialog({ productId, onSuccess }: AddResourceDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        url: "",
        type: "official_link" as "official_link" | "shopping" | "training" | "youtube" | "documentation" | "certification"
    });

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2">
                <PlusCircle className="w-4 h-4" />
                Add Resource
            </Button>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await addProductResource({
                product_id: productId,
                ...formData
            });

            if (result.success) {
                toast.success("Resource added successfully");
                setIsOpen(false);
                setFormData({ title: "", url: "", type: "official_link" });
                onSuccess();
            } else {
                toast.error(result.error || "Failed to add resource");
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
                <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Add Resource
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Official Resource</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Add a helpful link or video for this product.
                    </DialogDescription>
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
                            placeholder="e.g. Official Tutorial"
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
                            placeholder="https://..."
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
                            Add Resource
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
